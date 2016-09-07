INSERT INTO haveyoursay.slt_tbl(name, color, startdate, enddate) VALUES ('Richard Spelman', 'blue', '5 Sep 2016', '13 Sep 2016');
INSERT INTO haveyoursay.slt_tbl(name, color, startdate, enddate) VALUES ('Simon O''Conner', 'green', '19 Sep 2016', '2 Oct 2016');


INSERT INTO haveyoursay.card_tbl(slt_id, question, why, lookingintoit, whatwedid, likes)
  VALUES (1, 'First Title', 'why 1', '', '', 0);
INSERT INTO haveyoursay.comment_tbl(description, createdon)
  VALUES ('Second Comment sdjhasdfs fsd fgsdf gsf hsf hg rsts ethftx hdz gsf hdr tdz hcf hdzr gsfth sdg dxr gfzdf gdzf gd ', '14 Jul 2016 10:35am');
INSERT INTO haveyoursay.comment_tbl(description, createdon)
  VALUES ('First Comment', '14 Jul 2016 10:35am');


INSERT INTO haveyoursay.card_tbl(slt_id, question, why, lookingintoit, whatwedid, likes)
  VALUES (1, 'Second Title', 'why 2', 'lookingintoit 2', '', 1);

INSERT INTO haveyoursay.card_tbl(slt_id, question, why, lookingintoit, whatwedid, likes)
  VALUES (2, 'Third Title', 'why 3', 'lookingintoit 3', 'whatwedid 3', 0);

INSERT INTO haveyoursay.card_tbl(slt_id, question, why, lookingintoit, whatwedid, likes)
  VALUES (1, 'Fourth Title', 'why 4', 'lookingintoit 4', 'whatwedid 4', 5);
