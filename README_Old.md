# Donny's List
Project based on providing online coaching. Build on top of MERN platform using Javascript ES6 Features.

## Branch `oct1-merged` has most recented changes merged in from master branch as well as the other branches. It is possible that I missed something while diffing and merging, so please bring up any issues. --As of Oct 8,2018.

##Contains most current files from the repositories as of Oct 7 2018 , when master branch was merged into oct1-merged branch

## Setting up

1) Clone the project
`git clone https://<your login on bitbucket>@bitbucket.org/donnydey/donnies-list.git`

2) Setup mongo db.
- install the database
- create a database folder, e.g. `~/mongodb`
- run the databse from terminal `mongod --dbpath ~/mongodb`

3) Clone mongo database from 'live' server using the following script (macOS or Linux):
```
#!/bin/sh

# This command will create mongodb dump archive on the remote computer, send it back to local machine and install on local mondodb.
ssh -i <your private key, must be registered on 45.55.254.21> <your user name>@45.55.254.21 '( mongodump --archive )' | mongorestore --archive
```
Every time you need to sync the data, you can delete the old database, e.g. - stop mongod, do `rm -rf ~/mongodb/*`, then start mogod and sync with remote 'live' db.<br />
In case you get an error like mongorestore command not found:
- execute `ssh -i <your private key, must be registered on 45.55.254.21> <your user name>@45.55.254.21 --out <folder_to_store_dump>` on server to get mongo db dump files.
- then use `mongorestore <folder_with_mongo_dump>` on local machine to restore data.
    
2) Setup mongo db.
- install the database
- create a database folder, e.g. `~/mongodb`
- run the databse from terminal `mongod --dbpath ~/mongodb`
3) Clone mongo database from 'live' server using the following script (macOS or Linux):
```
#!/bin/sh

# This command will create mongodb dump archive on the remote computer, send it back to local machine and install on local mondodb.
ssh -i <your private key, must be registered on 45.55.254.21> <your user name>@45.55.254.21 '( mongodump --archive )' | mongorestore --archive
```
Every time you need to sync the data, you can delete the old database, e.g. - stop mongod, do `rm -rf ~/mongodb/*`, then start mogod and sync with remote 'live' db.
4) Setup server
- open either cmd (on Windows) or terminal (on macOS/Linux) window
- `cd` into the `server` folder
- use either `npm install` or `yarn` to install packages
- run server api using `yarn start` or `yarn dev`

Note: For yarn to install packages properly you need Python2, Visual Studio Build Tools installed and PATH variable set.

5) Do the same on the `client` folder to start React application
8) You can check the `live-code-server` for main.js and index.js files if they are missing in your repo


6) You can check the `live-code-server` for main.js and index.js files if they are missing in your repo

## How to set up ssh with key access

### User setup

Note that these instructinons are for macOS/Linux users. There is a separate process for Windows, which I might describe later if needed.

1) Open terminal and choose a directory where you will keep your private keys for the remote access.

2) Run the following command:

`ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f donnieslist`

It will ask you for a password then create two files:

- "donnieslist", a private key, that you shoudl keep secure
- "donnieslist.pub", a public key

You may choose to use a passphrase or just leave it without a password. Note however that in later case everyone who has access to the key will be able to login to the server.

3) Send you public key, "donnieslist.pub" to Donny or a system administrator who will add the key to a list of trusted keys

4) When the key is updated on the server you can login using the following command:

`ssh -i <path to donnieslist generate above> <username>@45.55.254.21`

In place of `username` you will need to use the name that will be created for you another user


### Server setup

1) Create a new user or select a user which already exists, e.g. - 'ubuntu'

`sudo adduser <username>`

You will be asked to provide a password. Even though he will be able to login with a key, he still need a password to do certain tasks, like perform `sudo` commands.

Then there will be a bunch of other self-explanatory questions.

2) Then pretend you are a new user:

`sudo su <username>`

3) Now you will act as a new user and can add his keys.

- go to his home directory:

`cd`

- make sure .ssh folder exists:

`mkdir .ssh`

you may get an error message saying that the directory already exists

- open or create the file:

`vi .ssh/authorized_keys`

- if the file contains no data then paste the content of the user public key, which you should have received

- if you are adding keys to an existing account add the key as a new line in the end

- save the file

4) Make sure nobody except the current user has acceess to the key:

`chmod 700 .ssh`

`chmod 600 .ssh/authorized_keys`

5) Type `exit` to return back to your account. That's it. Now the user should be able to login with his private key as described above.



### Running using docker:

#### Before you start do the following:

1) Make sure 80 port is unused, kill nginx and apache servers on your local box.

2) Kill mongo service.

3) Add `https://www.donnieslist.com/` in `/etc/hosts`.(Be sure to comment this line to access production instance).

#### Running your dev server:
1) Install docker community edition.

2) Enter server folder run `docker build -t server -f Dockerfile.dev  .`

3) Enter client folder run `docker build -t client -f Dockerfile.dev .`

4) Enter balancer folder run `docker build -t balancer -f Dockerfile.dev .`

5) Run following command from root app folder.
`docker build -t db https://github.com/docker-library/mongo.git#:4.1`

6) Run `docker swarm init`
7) Run `docker stack deploy -c docker-compose.yml donnies-list` to start your server.

###Update as on 25th February 2019
####Important files:
#####1. Update url as per running environment in `client/actions/index.js `
######1.1.
`http://localhost:3000/api` for `API_URL` , `http://localhost:5000`  for `CLIENT_ROOT_URL` and `http://localhost:3000` for `Image_URL` when running `locally`.
######1.2.
`http://localhost:3000/api` for `API_URL` , `http://localhost:5000`  for `CLIENT_ROOT_URL` and `http://localhost:3000` for `Image_URL` when running `locally`.
######1.3.

`https://www.donnieslist.com/api` for `API_URL` , `https://www.donnieslist.com`  for `CLIENT_ROOT_URL`  and `https://www.donnieslist.com` for `Image_URL`  when running `on server`.

#####2. To run application on local above configs are good to go, but to be able run application on server below nginx configuration is used.
######In /etc/nginx/sites-enabled/default 
```
 server {
     listen 80 default_server; 
     listen 443 ssl default_server;
     ssl_certificate /root/donnieslist.com.chained.crt;
     ssl_certificate_key /root/donnieslist.key;
     server_name donnieslist.com www.donnieslist.com;
     # assets caching
         location /uploads {
          proxy_pass http://localhost:3000;     }
     location / {
         proxy_redirect off;
         proxy_http_version 1.1;
         proxy_pass http://localhost:5000/;
         proxy_set_header Host $host ; 
         proxy_set_header X-Real-IP $remote_addr; 
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
        location /api {
             proxy_pass http://localhost:3000;
         }
         
         location /socket.io {
            proxy_set_header    Upgrade          $http_upgrade;
            proxy_set_header    Connection       "upgrade";
            proxy_http_version  1.1;
            proxy_pass         http://localhost:3000/socket.io;
         }
 
 }
```
######In /etc/nginx/nginx.conf

```$xslt
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
	worker_connections 768;
	# multi_accept on;
}

http {

	##
	# Basic Settings
	##

	sendfile off;
	tcp_nopush on;
	tcp_nodelay on;
	keepalive_timeout 65;
	types_hash_max_size 2048;
	# server_tokens off;

	# server_names_hash_bucket_size 64;
	# server_name_in_redirect off;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;

	##
	# SSL Settings
	##

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # Dropping SSLv3, ref: POODLE
	ssl_prefer_server_ciphers on;

	##
	# Logging Settings
	##

	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;

	##
	# Gzip Settings
	##

	gzip on;
	gzip_disable "msie6";

	# gzip_vary on;
	# gzip_proxied any;
	# gzip_comp_level 6;
	# gzip_buffers 16 8k;
	# gzip_http_version 1.1;
	# gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

	##
	# Virtual Host Configs
	##

	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;
}

```
#####3.To start applications on given ports we have used pm2 node process manager.
######Go to server folder and enter following command
`pm2 start index.js`
######Go to client folder and enter following command
`pm2 start client.js`

######After this applications will start on mentioned ports.

#####Now you all set to go , you will see application live on server.

Map file new additions:
	1. src/components/pages/MapComponent.js
	2. src/components/pages/MapPage.js
Existing code file changes:
	1. client/index.html from line number 23 to 27 and line number 55.
	2. src/components/template/header.js from line number 80 to 93.
	3. src/routes.js line number 10 and line number 71.
I'm not pushing the file changes due to mapbox dependency installations, because these dependencies has to be installed on server side before deploying.
To install dependencies :
#####Navigate to client folder and enter following command
`sudo npm install mapbox-gl --save`
This will install map dependency in node_modules.
