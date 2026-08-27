import { Client } from 'pg';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
};

function reply(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function uuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function withDb(env, fn) {
  if (!env.HYPERDRIVE?.connectionString) throw new Error('HYPERDRIVE binding is not configured');
  const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
  await client.connect();
  try { return await fn(client); } finally { await client.end(); }
}

async function audit(db, facilityId, eventType, entityType, entityId, detail = {}) {
  await db.query(
    `INSERT INTO audit_events (facility_id,event_type,entity_type,entity_id,detail)
     VALUES ($1,$2,$3,$4,$5::jsonb)`,
    [facilityId || null, eventType, entityType || null, entityId || null, JSON.stringify(detail)]
  );
}

const animalFields = ['owner_id','species','name','breed','size','date_of_birth','microchip','vaccination_status','desexed_status','weight_kg','allergies','diet','medication_plan','physio_plan','behaviour_notes','handling_notes','reactivity','energy','social_confidence','gate_sensitivity','play_style','storm_sensitive','heat_risk','escape_risk','resource_guarding','not_social_today','active'];

async function createAnimal(db, facilityId, body) {
  const fields = animalFields.filter(k => body[k] !== undefined);
  if (!body.name || !body.species) throw new Error('name and species are required');
  const cols = ['facility_id', ...fields];
  const vals = [facilityId, ...fields.map(k => body[k])];
  const params = vals.map((_, i) => `$${i + 1}`).join(',');
  const result = await db.query(`INSERT INTO animals (${cols.join(',')}) VALUES (${params}) RETURNING *`, vals);
  await audit(db, facilityId, 'animal.created', 'animal', result.rows[0].id, { name: result.rows[0].name });
  return result.rows[0];
}

async function updateAnimal(db, facilityId, id, body) {
  const fields = animalFields.filter(k => body[k] !== undefined && k !== 'species');
  if (!fields.length) throw new Error('no supported fields supplied');
  const vals = fields.map(k => body[k]);
  const sets = fields.map((k, i) => `${k}=$${i + 1}`).join(',');
  vals.push(id, facilityId);
  const result = await db.query(`UPDATE animals SET ${sets} WHERE id=$${vals.length - 1} AND facility_id=$${vals.length} RETURNING *`, vals);
  if (!result.rowCount) return null;
  await audit(db, facilityId, 'animal.updated', 'animal', id, { fields });
  return result.rows[0];
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    try {
      if (url.pathname === '/api/health' && method === 'GET') {
        return withDb(env, async db => {
          const r = await db.query('SELECT current_database() AS database, current_user AS role, now() AS server_time');
          return reply({ ok: true, service: 'genevieve-kennels-api', ...r.rows[0] });
        });
      }

      // Authentication is the next gate. Until it is installed, every data route
      // requires an explicit facility UUID and must not be exposed publicly.
      const facilityId = request.headers.get('x-facility-id');
      if (!uuid(facilityId)) return reply({ error: 'valid x-facility-id required' }, 400);

      if (url.pathname === '/api/dashboard' && method === 'GET') {
        return withDb(env, async db => {
          const [animals,tasks,incidents,kennels] = await Promise.all([
            db.query('SELECT count(*)::int AS count FROM animals WHERE facility_id=$1 AND active=true',[facilityId]),
            db.query("SELECT count(*)::int AS count FROM care_tasks WHERE facility_id=$1 AND status NOT IN ('completed','cancelled')",[facilityId]),
            db.query("SELECT count(*)::int AS count FROM incidents WHERE facility_id=$1 AND status <> 'closed'",[facilityId]),
            db.query('SELECT count(*)::int AS count FROM kennels WHERE facility_id=$1 AND active=true',[facilityId]),
          ]);
          return reply({ animals: animals.rows[0].count, openTasks: tasks.rows[0].count, openIncidents: incidents.rows[0].count, kennels: kennels.rows[0].count });
        });
      }

      if (url.pathname === '/api/animals' && method === 'GET') {
        return withDb(env, async db => reply((await db.query('SELECT * FROM animals WHERE facility_id=$1 AND active=true ORDER BY name',[facilityId])).rows));
      }
      if (url.pathname === '/api/animals' && method === 'POST') {
        const body = await request.json();
        return withDb(env, async db => reply(await createAnimal(db, facilityId, body), 201));
      }

      const animalMatch = url.pathname.match(/^\/api\/animals\/([^/]+)$/);
      if (animalMatch && uuid(animalMatch[1]) && method === 'PATCH') {
        const body = await request.json();
        return withDb(env, async db => {
          const row = await updateAnimal(db, facilityId, animalMatch[1], body);
          return row ? reply(row) : reply({ error: 'animal not found' }, 404);
        });
      }
      if (animalMatch && uuid(animalMatch[1]) && method === 'DELETE') {
        return withDb(env, async db => {
          const r = await db.query('UPDATE animals SET active=false WHERE id=$1 AND facility_id=$2 RETURNING id,name',[animalMatch[1],facilityId]);
          if (!r.rowCount) return reply({ error: 'animal not found' },404);
          await audit(db,facilityId,'animal.archived','animal',animalMatch[1],{name:r.rows[0].name});
          return reply({ ok:true, id:animalMatch[1] });
        });
      }

      if (url.pathname === '/api/kennels' && method === 'GET') {
        return withDb(env, async db => reply((await db.query('SELECT * FROM kennels WHERE facility_id=$1 AND active=true ORDER BY zone,name',[facilityId])).rows));
      }
      if (url.pathname === '/api/tasks' && method === 'GET') {
        return withDb(env, async db => reply((await db.query('SELECT * FROM care_tasks WHERE facility_id=$1 ORDER BY due_at NULLS LAST,created_at DESC',[facilityId])).rows));
      }
      if (url.pathname === '/api/incidents' && method === 'GET') {
        return withDb(env, async db => reply((await db.query('SELECT * FROM incidents WHERE facility_id=$1 ORDER BY occurred_at DESC',[facilityId])).rows));
      }
      if (url.pathname === '/api/audit' && method === 'GET') {
        return withDb(env, async db => reply((await db.query('SELECT id,event_type,entity_type,entity_id,detail,occurred_at FROM audit_events WHERE facility_id=$1 ORDER BY occurred_at DESC LIMIT 200',[facilityId])).rows));
      }

      return reply({ error: 'not found' }, 404);
    } catch (error) {
      console.error(error);
      const status = error instanceof SyntaxError ? 400 : 500;
      return reply({ error: status === 400 ? 'invalid JSON request' : 'server error' }, status);
    }
  }
};
