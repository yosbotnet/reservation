L'applicativo e' hostato su https://clinic.ybaro.it/.
E' possibile hostarlo in locale dopo aver installato node e npm
Entrare in frontend, eseguire ``npm i`` e poi npm start
In un altra shell andare nel backend ed eseguire ``npm i`` e poi npm start.
Di default dovrebbe trovarsi il frontend nella porta 8787 e il backend nella porta 8888!
il file .env del backend contiene la connection string per il database. Viene utilizzata
da prisma ORM. Il database e' postgres e i suoi script sono disponibili nella cartella db, 
ma per riprodurre consiglio di andare nel backend ed eseguire npx prisma db push --schema=src/schema/prisma.schema.
Avevo scritto degli script apposta per le esecuzioni ma erano troppo imprevedibili! in ogni caso si trovano in utils/