DROP SCHEMA haveyoursay CASCADE;

CREATE SCHEMA haveyoursay;
CREATE SEQUENCE haveyoursay.card_seq;
CREATE SEQUENCE haveyoursay.comment_seq;

CREATE TABLE haveyoursay.card_tbl (
  id BIGINT NOT NULL PRIMARY KEY DEFAULT NEXTVAL('haveyoursay.card_seq'),
  color VARCHAR NOT NULL DEFAULT 'blue',
  question VARCHAR NOT NULL,
  why VARCHAR NOT NULL,
  lookingintoit VARCHAR NOT NULL DEFAULT '',
  whatwedid VARCHAR NOT NULL DEFAULT '',
  likes INT NOT NULL DEFAULT 0,
  createdon TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE haveyoursay.comment_tbl (
  id BIGINT NOT NULL PRIMARY KEY DEFAULT NEXTVAL('haveyoursay.comment_seq'),
  card_id BIGINT REFERENCES haveyoursay.card_tbl DEFAULT CURRVAL('haveyoursay.card_seq'),
  description VARCHAR NOT NULL,
  createdon TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE VIEW haveyoursay.card_vw AS
  SELECT ca.id, ca.color, ca.question, ca.why, ca.lookingintoit, ca.whatwedid, ca.createdon
  FROM haveyoursay.card_tbl ca;

CREATE VIEW haveyoursay.comment_vw AS
  SELECT co.id, co.card_id, co.description, co.createdon
  FROM haveyoursay.comment_tbl co
    INNER JOIN haveyoursay.card_tbl ca ON (co.card_id = ca.id);
