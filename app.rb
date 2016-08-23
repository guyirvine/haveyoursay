require 'sinatra'
require 'json'
require 'fluiddb2'

before do
  @db = FluidDb2.db(ENV['DB'])
end

after do
  @db.close
end

get '/card' do
  sql = 'SELECT ca.id, ca.color, ca.question, ca.why, ca.lookingintoit,
                ca.whatwedid, ca.likes, ca.createdon
          FROM haveyoursay.card_vw ca
          ORDER BY ca.createdon'
  @db.query_for_resultset(sql).to_json
end

get '/comment' do
  sql = 'SELECT co.id, co.card_id, co.description, co.createdon
          FROM haveyoursay.comment_vw co
          ORDER BY co.createdon DESC'
  @db.query_for_resultset(sql).to_json
end

post '/card/:id/comment' do
  sql = 'INSERT INTO haveyoursay.comment_tbl(card_id, description )
           VALUES (?, ?)'
  data = JSON.parse request.body.read
  payload = [params[:id], data['description']]
  @db.execute(sql, payload)
end

put '/card/:id' do
  sql = 'UPDATE haveyoursay.card_tbl
         SET question = ?,
             why = ?,
             lookingintoit = ?,
             whatwedid = ?
         WHERE id = ?'

  data = JSON.parse request.body.read
  payload = [data['question'],
             data['why'],
             data['lookingintoit'],
             data['whatwedid'],
             params[:id]]
  @db.execute(sql, payload)
end

put '/card/:id/likes' do
  sql = 'UPDATE haveyoursay.card_tbl
         SET likes = ?
         WHERE id = ?'

  data = JSON.parse request.body.read
  payload = [data['likes'].to_i,
             params[:id]]
  @db.execute(sql, payload)
end

post '/card' do
  sql = 'INSERT INTO haveyoursay.card_tbl(question, why)
         VALUES (?,?)'

  data = JSON.parse request.body.read
  payload = [data['question'],
             data['why']]
  @db.execute(sql, payload)

  @db.query_for_value("SELECT CURRVAL('haveyoursay.card_seq')")
end
