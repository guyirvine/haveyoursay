require 'rake/testtask'

Rake::TestTask.new do |t|
  t.libs << 'test'
end

task :db do
  # dropdb haveyoursay`
  # createdb haveyoursay`
  `psql -f sql/create_tables.sql haveyoursay`
  `psql -f sql/seed.sql haveyoursay`
end

task :push do
  p `aws --profile admin s3 sync public/ s3://haveyoursay.guyirvine.com --acl public-read`
end

desc 'Run Push'
task :default => :push
