#!/bin/bash
cd backend || exit 1 && npm run build
cd ../frontend || exit 1 && npm run build