#!/bin/bash

# MongoDB connection string
URI="$1"

# Directory containing exported JSON files
DATA_DIR="DatabaseData"

# Import each collection
mongoimport --uri "$URI" --collection eventaverages --file "$DATA_DIR/EventAverages.json"
mongoimport --uri "$URI" --collection featureflags --file "$DATA_DIR/FeatureFlags.json"
mongoimport --uri "$URI" --collection pagenavigations --file "$DATA_DIR/PageNavigations.json"
mongoimport --uri "$URI" --collection participantanswers --file "$DATA_DIR/ParticipantAnswers.json"
mongoimport --uri "$URI" --collection participantdatas --file "$DATA_DIR/ParticipantDatas.json"
mongoimport --uri "$URI" --collection participantevents --file "$DATA_DIR/ParticipantEvents.json"
mongoimport --uri "$URI" --collection physiologicaldatas --file "$DATA_DIR/PhysiologicalDatas.json"
mongoimport --uri "$URI" --collection questions --file "$DATA_DIR/Questions.json"
