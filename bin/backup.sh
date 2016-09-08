#!/bin/bash

source ~/.env

FILE_NAME=haveyoursay.sql
COMPRESSED_FILE_NAME=haveyoursay.$(date +%Y%m%d).tar.bz2
WORKING_DIR=/data/ls/rapidprototyping/haveyoursay/backup

mkdir -p $WORKING_DIR

find "$WORKING_DIR" -iname 'haveyoursay.*.tar.bz2' -type f -mtime +6 -delete

pg_dump --host=galvatron --username=$PGSQL_USERNAME haveyoursay >> $WORKING_DIR/haveyoursay.sql || exit 1

tar -jcf "$WORKING_DIR/$COMPRESSED_FILE_NAME" -C "$WORKING_DIR" haveyoursay.sql || exit 2
rm $WORKING_DIR/haveyoursay.sql || exit 3

rm -f "$WORKING_DIR/$FILE_NAME.latest.tar.bz2" || exit 4
ln -s "$WORKING_DIR/$COMPRESSED_FILE_NAME" "$WORKING_DIR/$FILE_NAME.latest.tar.bz2" || exit 5
