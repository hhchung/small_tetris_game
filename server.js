var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    qs = require('querystring'),
    mysql = require('mysql'),
    port = 9889;

//var connection;
/*
var connection = mysql.createConnection({
    host: 'dbhome.cs.nctu.edu.tw',
    user: 'hhchung_cs',
    password: '0116327hhchung',
    database: 'hhchung_cs_tetris_game'
});
*/

/*
connection.connect(
    function(err){
        if(err ){
            console.log('Error connecting to database');
            return;
        }
        console.log('connection established');
    }
);

*/

var insert_data = {
    'user':'anonymous',
    'best_score': 0
};


var searchscore = 'SELECT *  FROM user WHERE `user`= ?';
var createuser = 'INSERT INTO user SET ?';
var updatescore = 'UPDATE `user` SET `best_score` = ? WHERE user = ?';

/*
connection.query( queryString , function( err , rows , fields ){
    if(err) throw err;
    var i;
    for( i in rows  ){
        console.log("USER: "+rows[i].user+" score: "+rows[i].best_score);
    }
});
*/
var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
};


http.createServer(function(request, response) {

    var uri = url.parse(request.url).pathname , filename = path.join(process.cwd(), uri);
    var bscore = -1;
    if( request.method == 'POST' ){
        /*
        var connection = mysql.createConnection({
            host: 'dbhome.cs.nctu.edu.tw',
            user: 'hhchung_cs',
            password: '0116327hhchung',
            database: 'hhchung_cs_tetris_game'
        });
        */
    
        console.log("POST");
        var body='';
        var post_data={};
        var insert_data = {
             'user':'anonymous',
             'best_score': 0
        };
        
        
        request.on('data',function(data){
            body += data;
        });
        //console.log("FN:"+uri);
        if( uri == "/login"){
            
            var connection = mysql.createConnection({
                host: 'dbhome.cs.nctu.edu.tw',
                user: 'hhchung_cs',
                password: '0116327hhchung',
                database: 'hhchung_cs_tetris_game'
            });
            
            console.log("login");
            
            connection.connect();
            request.on('end' , function(){
                 console.log("login");
                 console.log(body);
                 post_data=qs.parse(body);
                 //connection.connect();

                 connection.query( searchscore , post_data['user'], function( err , rows  ){
                     if( rows.length == 0 ){
                        bscore=0;
                        insert_data['user']=post_data['user'];
                        console.log("Create this user:"+post_data['user']);
                        connection.query( createuser , insert_data , function(err , rows){
                            if(err){console.log("Insert User: "+post_data['user']+" fail");console.log(err); bscore=-1; }
                        });
                        response.writeHead( 200 , {'Content-Type': 'text/html'}  );
                        response.write(""+bscore);
                        response.end();
                        console.log("best score:"+bscore);
                        connection.end();
                    }else{

                        bscore=rows[0].best_score;
                        console.log("User:"+post_data['user']+" has already existed");
                        response.writeHead( 200 , {'Content-Type': 'text/html'}  );
                        response.write(""+bscore); //convert to string
                        response.end();
                        console.log("best score:"+bscore);
                        connection.end();
                    }
                });
                
                //connection.end();
            });
            console.log("-------");
        }else if( uri == "/record" ){
            console.log('record');
            var connection = mysql.createConnection({
                host: 'dbhome.cs.nctu.edu.tw',
                user: 'hhchung_cs',
                password: '0116327hhchung',
                database: 'hhchung_cs_tetris_game'
            });

            
            
            console.log(body);
            request.on('end' , function(){
                post_data=qs.parse(body);
                console.log(post_data);
                connection.connect();
                connection.query( searchscore , post_data['user'], function( err , rows  ){
                    //console.log("rows:"+rows);

                    if( rows.length == 0 ){
                        //some error
                        console.log("some error");
                        response.writeHead( 200 , {'Content-Type': 'text/html'}  );
                        response.write("error"); //convert to string
                        response.end();
                        connection.end();
                        //return;
                   }else{
                       //console.log("here");
                       //console.log("in query: "+post_data['user']);

                       bscore=rows[0].best_score;
                       if( post_data['best_score'] > parseInt(bscore) ){ //update the new high score
                           //console.log("ishere");
                           connection.query( updatescore , [post_data['best_score'] , post_data['user'] ] , function(){
                               response.writeHead( 200 , {'Content-Type': 'text/html'}  );
                               response.write("update score");
                               response.end();
                           });
                           connection.end();
                       }else{
                           //console.log("isnothere");
                           response.writeHead( 200 , {'Content-Type': 'text/html'}  );
                           response.write("no need to update");
                           response.end();
                           connection.end();
                       }
                   }
                    //connection.end();
               });
               //connection.end();
           });
        }else if( uri == "/endconnection"){ 
            //console.log("mysql connection close");
            //connection.end();
        }
        console.log("-------");
    }else{   //for get request
        fs.exists(filename, function(exists) {
            if(!exists) {
                response.writeHead(404, {"Content-Type": "text/plain"});
                response.write("404 Not Found\n");
                response.end();
                return;
            }

            if (fs.statSync(filename).isDirectory()) filename += '/index.html';
            fs.readFile(filename, "binary", function(err, file) {
                if(err) {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write(err + "\n");
                    response.end();
                    return;
                }

                var headers = {};
                var contentType = contentTypesByExtension[path.extname(filename)];
                if (contentType) headers["Content-Type"] = contentType;
                response.writeHead(200, headers);
                response.write(file, "binary");
                response.end();
            });

        });
    }
}).listen(parseInt(port, 10));
