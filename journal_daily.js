let canvasHeight;
let canvasWidth;
var table; 
let MAX_MONTH = 4; 
var journal = new Array(MAX_MONTH);
var work_type_list = ["Class","Class Recording","Meeting","Design","3D","Dev, Coding","Immersive Media","Career Related","Writing & Research","Communication","Reading","Others"];
var work_type_colors = ["#efefef","#7ceada","#ffb1eb","#f38a8a","#94ccff","#67abe9","#6774e9","#bfbaff","#f6b26b","#f6ea75","#aaf390","#bdeaf6"];
var weekday = ["SUN","MON","TUE","WED","THU","FRI","SAT"]
var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
let ypos_list = [] 
let total_list = [];
let total_hours = 0; 
let hover;
let hover_id;

// animation control
let d_scale = 0.0;
let i1 = 0;
let j1 = 0;

// change this to control month (0~11). -1 is option ALL
var m_selected = 0;
let update = true; 

// variables to control graph sizes - size_adjustment() function controls these values
let height = 0;
let scale = 0;
let xfirst_bubble = 0;
let xfirst_bar = 0;
let yfirst = 0;
let ymargin = 0;

// alpha for animation and transparency
let alpha = 0.0;

// bubble size
let max_size = height*5;

// buttons
let btn_width = 60;
let btn_height = 30;
let btn_radius = 5;
let btn_x = [];
let btn_xmar = 60;
let btn_y = 90;

function preload(){
  table = loadTable("journal.csv", "csv");
}

function setup(){
  var canvas = createCanvas(canvasWidth, canvasHeight);
  size_adjustment();
  canvas.parent("sketch_daily");
  textFont("STHeiti");
  frameRate(60);
  noStroke();

  //print(table.getRowCount() + " total rows");
  
  // store cvs values in 2D array
  var m = 0;
  var d = 0;
  for (let i = 0; i < journal.length; i++) { 
    journal[i] = new Array(10); // 2d array initial setup
  } 
  for(let i=1; i<table.getRowCount(); i++){
    // start with index 1 to avoid first row (which is column name)
    let date = table.getString(i, 0);;
    let start_t = table.getString(i, 1);
    let end_t = table.getString(i, 2);
    let type = table.getString(i, 3);
    let duration = table.getString(i, 4);
    let work = new Work(date, start_t, end_t, type, duration);
    if (work.start_dt.getMonth() != m){
      m = work.start_dt.getMonth();
      d = 0;
    }
    journal[m][d] = work;
    //print(m+"|"+d+"|"+journal[m][d].start_dt.getMonth()); 
    d++;
  }
  //print(journal.length + " rows "+journal[0].length+"|"+journal[1].length+"|"+journal[2].length);
  
  // calculating sums
  calculateTotal();

  // generate list containing y position value for each work graph
  // change this part to control vertical margin
  set_ypos_list();

  frameRate(24);
}
function set_ypos_list(){
  ypos_list = [];
  let y = yfirst;
  for (let i=0; i<work_type_list.length;i++){
    ypos_list.push(y);
    y += ymargin;
  }
}

function draw(){
  background("#0E1017");
  hover = false;
  let xpos = xfirst_bubble;
  //let ypos = ypos_list;
  let current_date = -1;
  let current_month = -1;

  let ypos = yfirst;
  let xmargin = 120;
  // display time and vertical lines
  fill(200);
  textAlign(CENTER,CENTER);
  strokeWeight(1);
  stroke(30);
  for (let i=0; i<=24; i++){
    line(xfirst_bar+i*scale,yfirst-height/2,xfirst_bar+i*scale,yfirst+(height+ymargin)*31);
    text(i, xfirst_bar+i*scale, yfirst-height*2);
  }
  strokeWeight(0);

  // draw choice button
  drawButtons();

  fill(100);
  // display work type keys
  display_work_type();
  
  // rect color animation
  if (alpha<0.9){
    alpha += 0.05;
  } else {
    //noLoop();
  }

  
  if (m_selected == "-1"){
    // daily doesn't have ALL option
  } else {
      // option Single month
      for (let i=m_selected; i<=m_selected; i++){
        //print(i,"length");
        for (let j=0; j<journal[i].length; j++){
          let work = journal[i][j];
          let month = work.start_dt.getMonth();
          let date = work.start_dt.getDate();
          let day = weekday[work.start_dt.getDay()];
          let hour = work.start_dt.getHours();
          let mins = work.start_dt.getMinutes();
          let type = work.work_type_id;
          let duration = work.duration;
            
          // determine x position
          let xpos2 = xfirst_bar + (hour+mins/60) * scale;
          let width = duration * scale;
    
          // calculate y position
          //print(current_month+"/"+current_date+" | "+date);
          // margin if another month
          if (current_month != month){
            current_month = month;
          }
          // new line if another date 
          if (current_date != date){
            //print("- DAY BREAK -")
            if (current_date != -1){
              ypos = ypos + height + ymargin;
            }
            
            current_date = date;
            // print day
            if (day == "SAT" || day == "SUN")
            { 
              fill (100);  
            } else {
              fill (200);
            }
            // diaplay day date 
            textAlign(RIGHT,CENTER)
            text(day,xfirst_bubble-10,ypos);
            text(date,xfirst_bubble+10,ypos);
            
            // background bar
            fill("rgba(255,255,255,0.03)");
            rect(xfirst_bar, ypos-height/2, 24*scale, height);
            
          }
          // set alpha (Hover control)
          if (hover == true){
            if (hover_id != work.work_type_id){
              alpha = 0.2;
            } else {
              alpha = 0.9;
            }
          } 
          
          
          // set colors
          let c = colorAlpha(work_type_colors[work.work_type_id],alpha);
          fill(c);
          //fill(work_type_colors[work.work_type_id]);
          // rect (x,y,w,h)
          rect(xpos2, ypos-height/2, width, height);
        }
      }
  }
  
}

// windowResized() is called whenever the browser size changes.
function windowResized(){
  print("resize");
  size_adjustment();
  set_ypos_list();

}

function size_adjustment(){
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  resizeCanvas(canvasWidth, canvasHeight);
  height = canvasHeight/60;
  scale = canvasWidth*0.03;
  xfirst_bar = canvasWidth*0.1;
  xfirst_bubble = canvasWidth*0.07;
  yfirst = 180;
  ymargin = 5;
  max_size = height*6;
  for (let i=0;i<4 ;i++){
    btn_x[i] = canvasWidth/20+canvasWidth/12*i;
  } 
  btn_width = canvasWidth/14;
}

function drawButtons(){
  for (let i=0;i<btn_x.length;i++){
    // box
    if (i == m_selected){
      fill("#ACB0C1");
    } else {
      fill("#52555F");
    }
    rect(btn_x[i],btn_y,btn_width,btn_height,btn_radius);
    // text
    fill(0);
    textSize(14);
    text(months[i],btn_x[i]+btn_width/2,btn_y+btn_height/2);
    textSize(12);
    
  }
}

class Work{
  constructor(date, start_t, end_t, type, duration){
    // 1. CREATE TWO DATE OBJECTS FOR START, END TIME
    // date = mm/dd/yyyy
    let dt = date.split("/");
    // start time = hh:mm
    let t1 = start_t.split(":") 
    // end time = hh:mm
    let t2 = start_t.split(":") 
    // new Date(year, month[0~11], day, hour, minute, second, millisecond])
    this.start_dt = new Date(dt[2], dt[0]-1, dt[1], t1[0], t1[1]);
    this.end_dt = new Date(dt[2], dt[0]-1, dt[1], t2[0], t2[1]);

    // 2. WORK TYPE
    this.work_type = work_type_list[type-1];
    this.work_type_id = type-1;
    
    // 3. DURATION (in hours)
    this.duration = duration/60;
  }
}

function anim_reset(){
  d_scale = 0;
  i1 = 0;
  j1 = 0;
  alpha = 0;
  loop();
}

// returns array containing sums of work types in selected month. -1 is option ALL
function calculateTotal(){
  total_list = [0,0,0,0,0,0,0,0,0,0,0,0];
  total_hours = 0;
  
  if (m_selected == -1){
    // grand total
    print("Month: ALL");
    for (let i=0;i<journal.length;i++){
      for (let j=0;j<journal[i].length;j++){
        let temp = journal[i][j];
        total_list[temp.work_type_id] += temp.duration;
      }
    }

  } else {
    // single month
    print("Month: "+months[m_selected]);
    for (let j=0;j<journal[m_selected].length;j++){
      let temp = journal[m_selected][j];
      total_list[temp.work_type_id] += temp.duration;
    }
    

  }
  //print("Work Types: "+work_type_list);
  //print("Total Hours: "+total_list);

  for (let i=0;i<total_list.length;i++){
    total_hours += total_list[i];
  }
}


function mousePressed(){
  temp = checkButtonPressed();
  if (temp !='none'){
      update = true;
      m_selected = temp;
      //print("month:",checkButtonPressed());
      //print("X: ",mouseX);
      //print("Y: ",mouseY);
      anim_reset();
      calculateTotal();
      draw();

  } 
}
function checkButtonPressed(){
  if (mouseX > btn_x[0] && mouseX < btn_x[0]+btn_width && mouseY > btn_y && mouseY < btn_y+btn_height){
    // ALL
    return 0;
  } else if (mouseX > btn_x[1] && mouseX < btn_x[1]+btn_width && mouseY > btn_y && mouseY < btn_y+btn_height){
    // JAN
    return 1;
  } else if (mouseX > btn_x[2] && mouseX < btn_x[2]+btn_width && mouseY > btn_y && mouseY < btn_y+btn_height){
    // FEB
    return 2;
  } else if (mouseX > btn_x[3] && mouseX < btn_x[3]+btn_width && mouseY > btn_y && mouseY < btn_y+btn_height){
    // MAR
    return 3;
  } else {
    return 'none';
  }
}

function colorAlpha(aColor, alpha) {
  var c = color(aColor);
  return color('rgba(' +  [red(c), green(c), blue(c), alpha].join(',') + ')');
}
  

function display_work_type(){
  for (let i=0;i<work_type_list.length;i++){
    fill(work_type_colors[i]);
    let xpos_key = xfirst_bar+25*scale;
    let ypos_key = ypos_list[i]+i*10;
    circle(xpos_key, ypos_key, 10);
    textAlign(LEFT,CENTER);
    text(work_type_list[i],xpos_key+10, ypos_key);
    // check for hover
    //print(mouseX+" | "+mouseY + " -- " + (xfirst_bar+25*scale));
    if (mouseX >= xpos_key && mouseX <= xpos_key+100 && mouseY >= ypos_key-10 && mouseY <= ypos_key +10){
      //print("hover"+work_type_list[i]);
      hover = true;
      hover_id = i;
    } 
  }
}



