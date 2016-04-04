//basci version
var name_map =[ "i_shape", "z_shape", "s_shape", "o_shape" ,'j_shape' ,'l_shape' , 't_shape' , "bomb"];
var shape_map={ 'i_shape': i_shape , 'z_shape':z_shape , 's_shape':s_shape , 'o_shape':o_shape ,'j_shape':j_shape ,'l_shape':l_shape , 't_shape':t_shape  , "bomb":bomb};
var color_map={ 'i_shape': "DeepSkyBlue" , 'z_shape':"MediumBlue" , 's_shape':"orange" , 'o_shape':"yellow" ,'j_shape':"green" ,'l_shape':"purple" , 't_shape':"red" , 'bomb':'bomb'};
//bomb should be put at the end
//advance version
var name_map_ad  = [ "self_shape0","self_shape1" , "self_shape2" , "self_shape3"];
var shape_map_ad = { "self_shape0":self_shape0,"self_shape1":self_shape1 , "self_shape2":self_shape2 , "self_shape3":self_shape3 };
var color_map_ad = { "self_shape0":"lightgreen","self_shape1":"PaleVioletRed"  , "self_shape2":"brown" , "self_shape3":"SteelBlue" };


num_tetris = 0;

//console.log("Name:"+name_map.length);
login_flag = false;
//some standard
gold_line = 3;
gold_score = 100;



//modify to test
num_line = 0;
line_score = 100;
//number of  height 10 blocks
total_h = 20;
//number of  width 20 blocks
total_w = 10;
total_pixel_h = 750;
total_pixel_w = 375;
/*700 is the size*/
unit = total_pixel_h/20;     //a block size
game_pause=false;

canvas_pos_x = 0 ;
canvas_pos_y = 0 ;


var animate_time;
var elapsed_time;
//var target_pos =  new point(0,-2);
var map = new init_map( total_h , total_w );
//console.log("height:"+map.length);
//console.log("width:"+map[0].length);
var canvas;// = document.getElementById('game');
var ctx; //= canvas.getContext('2d');

var user="anonymous";

function Tetris( pos_x , pos_y  , shape_name , index ){
    this.x = pos_x;
    this.y = pos_y;
    this.color = color_map[shape_name];
    this.shape_name = shape_name;//shape_name;
    this.shape_index = index;
    this.shape = shape_map[shape_name][index];
    this.newblock = true;
}
Tetris.prototype.showpos = function(){
    console.log("Pos X:"+this.x.toString() );
    console.log("Pos Y:"+this.y.toString() );
};
Tetris.prototype.showshape = function(){
    var row , col;
    console.log("showshape");
    console.log("show shape index "+this.shape_index);
    for( row = 0 ; row < this.shape[0].length ; row++ ){
        for( col = 0 ; col < this.shape[0][0].length ; col++ ){
            console.log(this.shape[row][col] );
        }
    }
};
//remove tetris from map
Tetris.prototype.remove_target = function(){
    //console.log("remove");
    var row , col;
    for( row = 0 ; row < this.shape.length ; row++ ){
        for( col = 0 ; col < this.shape[0].length ; col++ ){
            if( this.shape[row][col] == 1 && this.y+row >= 0 && this.y+row <= total_h && this.x+col >= 0 && this.x+col < total_w  ){
                 map[this.y+row][this.x+col]="NO";
            }
        }
    }
}

//record tetris to map
Tetris.prototype.record_target = function(){
    //console.log("record");
    var row , col;
    for( row = 0 ; row < this.shape.length ; row++ ){
        for( col = 0 ; col < this.shape[0].length ; col++ ){
            if( this.shape[row][col] == 1 && this.y+row >= 0 && this.y+row <= total_h && this.x+col >= 0 && this.x+col < total_w  ){
                 map[this.y+row][this.x+col]=this.color;
            }
        }
    }
}


//will detect the collision is wall or block
//if no collision => remove the target old position
//if there is collision => remain the target position  => not display in the canvas
Tetris.prototype.collision = function( direction ){
    //console.log("collision");
    var ix = this.x;
    var iy = this.y;
    var index_i = this.shape_index;
    var row , col;
    //this.remove_target();
    if( !this.newblock ){
        this.remove_target();
    }
    switch( direction ){
        case "ROTATE":
            this.shape_index=(this.shape_index+1)%4;
            this.shape=shape_map[this.shape_name][this.shape_index];
            break; //don't need to modify
        case "LEFT":
            //this.remove_target(); //remove the current position
            ix = ix-1;
            break;
        case "RIGHT":
            //this.remove_target(); //remove the current position
            ix = ix+1;
            break;
        case "DOWN":
            //this.remove_target(); //remove the current position
            iy = iy +1;
            break;
    }
    for( row = 0 ; row < this.shape.length ; row++){
        for( col = 0 ; col < this.shape[0].length ; col++ ){
            if( this.shape[row][col] == 1  ){ //the real graph
                if( iy+row <= 0 ){ //cannot see part
                    if( ix+col < 0 || ix+col>=total_w){  //inorder to prevent s-shape
                        this.record_target();
                        return "BOUNDARY";
                    }else{
                        continue; //ignore for not testing the init block position
                    }
                }else if( ix + col  < 0  ||  ix + col >= total_w || iy+row > total_h ){
                    //console.log("This is boundary");
                    if( direction == "ROTATE" ){
                        this.shape_index = index_i;
                        this.shape=shape_map[this.shape_name][this.shape_index];
                    }
                    this.record_target();
                    return "BOUNDARY";
                }else if( map[iy+row][ix+col] != "NO" ){
                    //console.log("This is block");
                    if( direction == "ROTATE" ){
                        this.shape_index = index_i;
                        this.shape=shape_map[this.shape_name][this.shape_index];
                    }
                    this.record_target();
                    return "BLOCK";
                }
            }else{
                continue;
            }
        }
    }
    this.x = ix;
    this.y = iy;
    this.record_target();
    return "OK";
}


Tetris.prototype.move_left=function(){
    if(this.collision("LEFT") != "OK" ){
        //console.log("can not move left!");
    }else{
        target.newblock = false;
        draw_map(canvas_pos_x,canvas_pos_y);
    }
}

Tetris.prototype.move_right=function(){
    if(this.collision("RIGHT") != "OK" ){
        //console.log("can not move right!");
    }else{
        target.newblock = false;
        draw_map(canvas_pos_x,canvas_pos_y);
    }
}
Tetris.prototype.move_down=function(){
    if(this.collision("DOWN") != "OK" ){
        //console.log("can not move down!");
        //this.remove_line();  cannot use!
    }else{
        target.newblock = false;
        draw_map(canvas_pos_x,canvas_pos_y);
    }
}

Tetris.prototype.rotate=function(){

    console.log(this.shape_index);
    if( this.collision("ROTATE") != "OK" ){ //return the previous position
        //this.shape_index=original_index;
        //this.shape=shape_map[this.shape_name][this.shape_index];
    }
    //this.record_target();
    draw_map(canvas_pos_x,canvas_pos_y);
}


Tetris.prototype.remove_line=function(){
    //clearTimeout(timoutid);
    var is_line = true;
    var row;
    var col;
    var once_line = 0;
    var x;
    for( row = total_h ; row >= 1 ;  row-=1 ){  //fine line from buttom
        is_line = true;
        for( col = 0 ; col < total_w ; col++ ){  //cheeck line
            //console.log("IN ROW:"+row);
            if( map[row][col] == "NO" ){
                is_line = false;
                break;
            }
        }

        if( is_line ){ //update map
            num_line++;
            once_line++;

            //console.log("find line"+num_line);
            for(col = 0 ; col < total_w ; col++){ //remove the line
                map[row][col] = "NO";
            }

            for(row_s = row ; row_s > 1 ; row_s-- ){
                for( col = 0; col < total_w ; col++){
                    map[row_s][col] = map[row_s-1][col];
                }
            }
            for(col = 0 ; col < total_w ; col++){ //remove the line
                map[1][col] = "NO";
            }
            row+=1; //stay in the same line

        }
    }

    if( once_line > 0 ){
        var mul = Math.pow(2, once_line-1);
        var x = document.getElementById("score").innerHTML;
        x = parseInt(x)+ line_score*once_line+10*mul;
        document.getElementById("score").innerHTML = x;
    }
    //console.log("FINE LINE:"+num_line);
    //timoutid=setTimeout("reqAnimFrame(animate);", 500);
}

Tetris.prototype.reset=function(){

    //reset position
    this.x = Math.floor( (Math.random() * (total_w-3) ) );
    this.y = -3;
    //console.log("New tertris posX:"+this.x);
    //console.log("New tertris posY:"+this.y);

    //randomize  a shape name
    var index = Math.floor((Math.random() * name_map.length) );
    //console.log("New Block index:"+index);
    this.shape_name = name_map[index];
    if( num_tetris> 1 && num_tetris %4 == 0 && user == "iamdad" ){  //for demo
        this.shape_name = "bomb";
    }
    this.color = color_map[this.shape_name];
    this.shape_index = 0;
    this.shape = shape_map[ this.shape_name ][this.shape_index];
    this.newblock = true;



    //this.color = color_map[shape_name];
    //this.shape_name = shape_name;
    //this.shape_index = index;
    //this.shape = shape_map[shape_name][index];
}
/*
function delay_1s(){
    var date = new Date();
    var curDate = null;
    do {
        curDate = new Date();
    }while( curDate-date < 1000);
}
*/

function init_map( num_row , num_col ){
    var map_color = [];
    for( i = 0 ; i < total_h+1 ;  i++){
        map_color[i] = [];
    }
    for( i = 0 ; i < total_h+1 ; i++  ){
        for( j = 0 ; j < total_w ; j++ ){
            map_color[i][j] = "NO"; //NO represent empty
        }
    }
    return map_color;
}
var bomb_color = true;
function draw_map( base_x , base_y ){
    //var canvas = document.getElementById('game');
    //var ctx = canvas.getContext('2d');
    var row,col;
    var bomb_drawflag = false;
    var bomb_radius = unit/2;
    ctx.clearRect(0,0,total_pixel_w,total_pixel_h);
    for( row =  1  ; row <= total_h ; row++  ){
        for( col = 0 ; col < total_w ; col++ ){
            if( map[row][col] == "bomb"  ){
                bomb_drawflag = true;
                ctx.beginPath();
                ctx.arc( col*unit+bomb_radius, (row-1)*unit+bomb_radius, bomb_radius, 0, 2 * Math.PI, false);
                if( bomb_color ){
                    ctx.fillStyle = 'gray';
                }else{
                    ctx.fillStyle = 'white';
                }
                bomb_color = !bomb_color;
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'white';
                ctx.stroke();

            }else if( map[row][col] != "NO" && map[row][col] != "bomb" ){  //string compare
                ctx.fillStyle=map[row][col];  //the rectangle color
                ctx.fillRect( 0+col*unit , 0+(row-1)*unit , unit , unit );
                ctx.strokeStyle = "black"; //the grid color
                ctx.lineWidth=3;
                ctx.strokeRect( 0+col*unit , 0+(row-1)*unit , unit , unit);
            }
        }
    }
}


function keyboard(e){
    e = e || window.event;
    ek = e.keyCode;

    if( game_pause || !game_start ){  //in pause no read other action
        return;
    }
    if( ek >= 37 && ek <= 40){
        clearTimeout(animate_time);
    }
    if (ek==37){          //left
        target.move_left();
    }else if (ek==39){    //right
        target.move_right();
    }else if (ek==40){    //down
        target.move_down();
    }else if (ek==38){  //rotate
        target.rotate();//unrecord_target( target_shape , target_pos );
        //target_pos.y += 1; //up
        //lock=true;
    }

    //timoutid=setTimeout("reqAnimFrame(animate);", 500);
}


function unlock(e){
    e = e || window.event;
    ek = e.keyCode;
    if( !game_start ){
        return;
    }
    if( ek >= 37 && ek <= 40 && !game_pause){
        clearTimeout(animate_time);
        animate_time=setTimeout("reqAnimFrame(animate);", 500);
        //target.newblock = false; //has been move
    }else if( ek == 32 ){
        pause();
    }
}
//keycontrol event
if (window.addEventListener){
    window.addEventListener("keydown", keyboard);
    window.addEventListener("keyup", unlock );
}
else if (window.attachEvent){
    window.attachEvent("onkeydown", keyboard);
}
else
   window.onkeydown=keyboard;

function pause(){
    game_pause = !game_pause;
    if( game_pause ){
        clearTimeout(animate_time);
        clearInterval(elapsed_time);
    }else{
        //animate_time = setTimeout("reqAnimFrame(animate);", 500);
        elapsed_time = setInterval(timer_add, 1000);
        animate_time=setTimeout("reqAnimFrame(animate);", 500);
    }

}
function update_game_info(){
    document.getElementById("line").innerHTML=num_line;
    if( num_line >= gold_line ){
        document.getElementById("line").style.color="gold";
        document.getElementById("line").style.fontSize = "50px";
    }
    var score = document.getElementById("score").innerHTML;
    if( score >= gold_score ){
        document.getElementById("score").style.color="gold";
        document.getElementById("score").style.fontSize = "60px";
    }
}

function render_gameover(){
    var i;
    var x = 100 , y = 300;
    var text_size = 45;
    //ctx.clearRect(0,0,total_pixel_w,total_pixel_h);
    ctx.font = "bold 50px Comic Sans MS";
    var text = ['G' , 'A' , 'M' , 'E' , 'O' ,'V' , 'E' ,'R' ];
    var color = ['red' , 'orange' , 'yellow' , 'green' ,'lightblue' , 'blue' ,'purple' ,'white'];


    for( i=0 ; i < text.length ; i++){
        ctx.fillStyle = color[i];
        //ctx.clearRect(0,0,total_pixel_w,total_pixel_h);
        ctx.fillText( text[i] ,x ,y );
        ctx.fillStyle = "black";
        ctx.strokeText( text[i] ,x ,y );
        if( i == 3 ){
                y+=text_size;
                x = 100;
        }else{
            x+= text_size;
        }

    }
    //ctx.fillText("GAME OVER",10,50);
    //ctx.fillStyle="red";
    //animate_time=setTimeout("reqAnimFrame(animate);", 500);
}

function game_over(){

    render_gameover();
    game_start = false;
    game_pause = false;
    clearTimeout(animate_time);
    clearInterval(elapsed_time);
    var score = document.getElementById("score").innerHTML;
    $('#overmessage').css({display:'block'});
    $("#overmessage").dialog( {
        title: 'Game Over',
        autoOpen: false,
        width: 1000,
        height:600,
        modal:true,
        draggable: false,
        resizable: false,
        closeOnEscpe: true,
        show: {
            direction : 'up',
            effect: "drop",
            duration: 1500
        },
        hide:{
            effect: "explode",
            duration: 1500
        },
        buttons:{"Record Score": function(){  $.post("http://140.113.235.156:9889/record" , {'user':user, 'best_score':score} , function(data){
            $("#re-msg").html(data);
            $.post("http://140.113.235.156:9889/endconnection" , {'end':"end"} );
        } );         /*$(this).dialog("close");*/  }}

    } );
    var msg = "<span style='font-size:40px; color:yellow;'>Thanks your playing <span style='font-style:oblique;'>"+user+" </span>!</span><br>"
    var score = document.getElementById('score').innerHTML;
    var line = document.getElementById('line').innerHTML;
    var time = document.getElementById('time').innerHTML;
    var bscore = document.getElementById('bscore').innerHTML;

    msg += "<ul>"
    msg += "<li><span style='font-size:35px;'>Your Score: "+score+"</span></li>";
    msg += "<li><span style='font-size:35px;'>Previous Best Score:"+bscore+"</li>";
    msg += "<li><span style='font-size:35px;'>#line you remove: "+line+"</span></li>";
    msg += "<li><span style='font-size:35px;'>Elapsed Time: "+time+"</span> s</li>";
    msg += "</ul>"
    if( parseInt(score) > parseInt(bscore) ){
        msg += "<span style='font-size:25px; font-style:Comic; color:lightblue;'>Congratulation! You transcend yourself!</span><br>";
        document.getElementById('bscore').innerHTML = score;
    }

    msg += "<span style='font-size:25px; color:green'>Hope you had a great time!<br>";
    msg += "If you have any suggestion or find some bugs in this game, feel free to let me know.<br>";
    msg += "I really appreciate your help!<br>";
    msg += "my email address:<a href='mailto:ao403268.cs01@nctu.edu.tw' color='hotpink'>ao403268.cs01@nctu.edu.tw</a></span><br>";
    msg += "<span id='re-msg' style='font-size:35px; color:pink'></span>";
    //msg +="</font>";
    $('#overmessage').html(msg);
    setTimeout( function(){ $('#overmessage').dialog('open');} ,1000);
    //$('#dialog').html("Thanks your playing!");
}

function animate(){
    reqAnimFrame =  window.requestAnimationFrame ||     // Firefox 23 / IE 10 / Chrome
                    window.mozRequestAnimationFrame ||  // Firefox < 23
                   window.webkitRequestAnimationFrame;  // Safari
    //target.remove_target();
    //target.move_down();
    if(target.collision("DOWN") != "OK"){
        if( target.shape_name == "bomb" ){
            var row , col;
            for( row = -1 ; row <= 1 ; row++){
                for( col = -1 ; col <=  1 ; col++){
                    if( target.y+row >= 1 && target.y+row <= total_h && target.x+col >= 0 && target.x+col < total_w ){
                        map[ target.y+row][target.x+col] = "NO";
                    }
                }
            }
        }else{
            target.remove_line();
            add_basic_point();
            update_game_info();
            //check outside
            var col;
            for(  col = 0 ; col < total_w ; col++){
                if( map[0][col] != "NO" ){
                    game_over();
                    return;//return;
                }
            }
        }
        target.reset();
        num_tetris++;
    }else{
        target.newblock = false;
    }
    draw_map(0,0);
    //console.log(target_pos.y);
    //reqAnimFrame(animate);
    animate_time=setTimeout("reqAnimFrame(animate);", 500);
}

function clear_map(){
    var row , col;
    for( row = 0 ; row <= total_h ; row++ ){
        for( col = 0 ; col < total_w ; col++ ){
            map[row][col] = "NO";
        }
    }
    //if(game_start){
    game_start=false;
    game_pause=false;


    //target.newblock = true;
    clearTimeout(animate_time);
    clearInterval(elapsed_time);
    document.getElementById("line").innerHTML="0";
    document.getElementById("line").style.fontSize="25px";
    document.getElementById("line").style.color="white";
    document.getElementById("score").style.color="white";
    document.getElementById("score").innerHTML="0";
    document.getElementById("time").innerHTML="0";
    name_map = name_map.slice(0,7);
    var attr;

    for(  attr in color_map_ad ){
        delete color_map[attr];
    }

    for( attr in shape_map_ad ){
        delete shape_map[attr];
    }
    //console.log(name_map);

    draw_map(canvas_pos_x ,  canvas_pos_y);
    num_line = 0;

}
function randomize_map(){
    var not_line = false;
    var row , col , value , name;
    //console.log("Randomize function");
    if( game_start ){
        return;
    }

    //reinitialize map
    for( row = 0 ; row <= total_h ; row++){
        for( col = 0 ; col < total_w ; col++ ){
            map[row][col] = "NO";
        }
    }
    for(  row = total_h  ; row > total_h/2  ; row--){
        value = Math.floor( Math.random()*100+1  );
        //console.log(value);
        if( value >50 ){
            //console.log("value");
            not_line = false;  //can not appear a line
            for( col = 0 ; col <  total_w ; col++ ){
                value = Math.floor( Math.random()*100+1  );
                if( value > 50 ){
                    name  = Math.floor((Math.random() * (name_map.length)) );
                    if( name_map[name] == "bomb"){ //remove bomb
                        name = 0;
                    }
                    map[row][col] = color_map[ name_map[name] ];
                }else{  //is empty
                    not_line = true;
                }
            }
            if( not_line == false ){ //is a line
                for( col = 0 ; col <  total_w ; col++ ){
                    map[row][col] = "NO";
                }
            }
        }
    }
    //map[0][0] ="red";
}


var game_start = false;
function active_danger(){
    var attr;
    if( name_map.length == 8){
        name_map = name_map.concat(name_map_ad);
        //console.log(name_map);
        for(attr in color_map_ad){
            color_map[ attr ] = color_map_ad[ attr ];
        }
        for( attr in shape_map_ad ){
            shape_map[ attr ] = shape_map_ad[ attr ];
        }
    }
}
function timer_add(){
    var x = document.getElementById("time").innerHTML;
    document.getElementById("time").innerHTML = parseInt(x)+1;
}
function add_basic_point(){
    var x = document.getElementById("score").innerHTML;
    document.getElementById("score").innerHTML = parseInt(x)+10;
    //console.log(x);
}

function main(){
    if( !game_start ){
        //canvas = document.getElementById('game');
        //ctx = canvas.getContext('2d');
        elapsed_time = setInterval(timer_add, 1000);
        //randomize_map();
        game_start=true;
        target = new Tetris( 0 , -3 , "s_shape" , 0 );
        //target.reset();
        //document.getElementById("random").disabled = true;
        //draw_map(0,0);
        //target.showpos();
        //target.showshape();
        //map[1][0] =　"red";
        //draw_map(0,0);

        animate();
    }
}


$(document).ready(
    function(){
        //target = new Tetris( 0 , -2 , "l_shape" , 0 );
        //target.showpos();
        //target.showshape();
        //animate();
        canvas = document.getElementById('game');
        ctx = canvas.getContext('2d');
        //$("#login").dialog.removeClass( "ui-dialog" );
        //$("#login").css( "background-color" , "yellow" );
        //$("#login").css("background" , "yellow");
        //$("ui-widget-header").css("color" , "green");

        //$('#login').css({display:'block'});
        //$("#login").dialog().(".ui-widget-header").css("background","green");
        //$("#login").dialog().removeClass('.ui-dialog');
        //$(".login-dialog").css("background" , "red");

        $("#login").dialog( {
            title: 'Input your game name',
            autoOpen: true,
            dialogClass: 'login-dialog-header login-dialog-buttonpane',
            width: 500,
            height:250,
            modal:true,
            draggable: false,
            resizable: false,
            closeOnEscpe: true,
            show: {
                direction : 'up',
                effect: "drop",
                duration: 500 //2000
            },
            hide:{
                direction : 'up',
                effect: "slide",
                duration: 500 //1500
            },


            buttons:{"OK": function() { //$("#submit").click( function(){
										user=$("#uname").val();
                                        if( ! /^[A-Za-z0-9]+$/.test(user)){
                                            user="anonymous";
                                            $(this).dialog("close");
                                            return;
                                        }
                                        $("#user").html( user );
										$.post("http://140.113.235.156:9889/login" , {'user':user} , function(data){
                                        	/*alert(data);*/ if( parseInt(data) >= 0 ){ $("#bscore").html(parseInt(data)); }
                                            $.post("http://140.113.235.156:9889/endconnection" , {'end':"end"} );
										} );
										//});
										$(this).dialog("close"); }}
        } );
        $(".ui-corner-all").css("background-color", "lightblue");
    }
);


//$(document).ready( main );
