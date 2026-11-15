// Layered illustration of the local descent frame; relief is background scenery only.
export function createDescentRenderer(canvas){
  const c=canvas.getContext('2d');if(!c)return {draw(){},dispose(){}};
  let focus=0,zoom=1,ready=false,lastFrame=null,disposed=false;
  const stars=Array.from({length:100},(_,i)=>({x:(i*137.51)%1000,y:(i*73.41)%340,r:i%13===0?1.4:.65}));
  const earth=new Image();earth.src='./assets/earth.png';earth.onload=()=>{if(!disposed&&lastFrame)draw(lastFrame.s,{...lastFrame.options,dt:0});};
  function draw(s,{throttle=0,steer=0,paused=true,dt=0,time=s.time,motion=true}={}){
    lastFrame={s,options:{throttle,steer,paused,dt,time,motion}};
    const desiredFocus=Math.max(-140,Math.min(140,s.x*.45)),desiredZoom=s.y>220?Math.max(.55,220/s.y):1+Math.max(0,1-s.y/180)*.3;
    if(!ready||!motion){focus=desiredFocus;zoom=desiredZoom;ready=true;}else if(!paused){const k=1-Math.exp(-Math.min(dt,.1)*2);focus+=(desiredFocus-focus)*k;zoom+=(desiredZoom-zoom)*k;}
    const ground=420,sx=.98*zoom,sy=1.25*zoom,project=x=>500+(x-focus)*sx;
    const sky=c.createLinearGradient(0,0,0,500);sky.addColorStop(0,'#03070c');sky.addColorStop(1,'#121c26');c.fillStyle=sky;c.fillRect(0,0,1000,500);
    c.fillStyle='#d6dfe8';for(const star of stars){c.globalAlpha=star.r>1?.65:.3;c.beginPath();c.arc(star.x-focus*.025,star.y,star.r,0,Math.PI*2);c.fill();}c.globalAlpha=1;
    // Earth is an illustrative sky reference, not an ephemeris or surface-location claim.
    const ex=825-focus*.04,ey=80;c.save();c.beginPath();c.arc(ex,ey,24,0,Math.PI*2);c.clip();c.fillStyle='#326086';c.fillRect(ex-25,ey-25,50,50);if(earth.complete&&earth.naturalWidth)c.drawImage(earth,ex-40,ey-24,80,48);const night=c.createLinearGradient(ex-24,ey,ex+24,ey);night.addColorStop(0,'#0000');night.addColorStop(.5,'#0003');night.addColorStop(1,'#000e');c.fillStyle=night;c.fillRect(ex-25,ey-25,50,50);c.restore();
    for(let layer=0;layer<3;layer++){
      const base=340+layer*25;c.beginPath();c.moveTo(0,500);
      for(let x=-60;x<=1060;x+=20){const world=x+focus*(.08+layer*.06),ridge=Math.sin(world*.012+layer*2)*18+Math.sin(world*.037+layer)*8;c.lineTo(x,base+ridge*(1-layer*.18));}
      c.lineTo(1060,500);c.closePath();c.fillStyle=['#18212b','#222d36','#303c44'][layer];c.fill();
    }
    const soil=c.createLinearGradient(0,ground,0,500);soil.addColorStop(0,'#424b50');soil.addColorStop(1,'#252d32');c.fillStyle=soil;c.fillRect(0,ground,1000,80);
    // Stable seeded rocks and crater rims move with the local camera, never with random noise.
    for(let i=0;i<50;i++){
      const x=((i*143.7-focus*.8)%1100+1100)%1100-50,y=ground+10+(i*37%63),r=2+(i%6)*1.2;
      c.fillStyle='#192126';c.beginPath();c.ellipse(x+4,y+3,r*1.8,r*.45,0,0,Math.PI*2);c.fill();c.fillStyle=i%2?'#697176':'#515b61';c.beginPath();c.moveTo(x-r,y);c.lineTo(x-r*.4,y-r*.7);c.lineTo(x+r*.6,y-r*.5);c.lineTo(x+r,y);c.closePath();c.fill();
    }
    const zone=project(0),width=35*sx;
    c.fillStyle='#243b35';c.fillRect(zone-width,ground-2,width*2,8);c.strokeStyle='#a9e8bb';c.lineWidth=2;c.beginPath();c.moveTo(zone-width,ground);c.lineTo(zone+width,ground);c.stroke();
    c.setLineDash([3,9]);c.strokeStyle='#708e8555';c.beginPath();c.moveTo(zone,40);c.lineTo(zone,ground);c.stroke();c.setLineDash([]);
    for(const side of [-1,1]){const x=zone+side*width;c.strokeStyle='#9aaea6';c.beginPath();c.moveTo(x,ground);c.lineTo(x,ground-16);c.stroke();const glow=c.createRadialGradient(x,ground-16,0,x,ground-16,8);glow.addColorStop(0,'#c6f3beaa');glow.addColorStop(1,'#b4eead00');c.fillStyle=glow;c.fillRect(x-8,ground-24,16,16);}
    c.font='12px monospace';c.textAlign='center';c.fillStyle='#d3ebd9';c.fillText('LANDING ZONE · ±35 m',zone,ground+35);
    c.setLineDash([6,10]);c.strokeStyle='#a1695555';for(const side of [-1,1]){const x=project(side*350);c.beginPath();c.moveTo(x,40);c.lineTo(x,ground);c.stroke();}c.setLineDash([]);
    const x=project(s.x),y=ground-s.y*sy;
    const shadowWidth=Math.max(7,25-s.y*.06)*zoom;c.fillStyle=`rgba(5,9,12,${Math.max(.05,.4-s.y/700)})`;c.beginPath();c.ellipse(x,ground+2,shadowWidth,shadowWidth*.18,0,0,Math.PI*2);c.fill();
    if(!paused&&s.fuel>0&&throttle>0&&s.y<45){
      const strength=(1-s.y/45)*throttle;
      for(let i=0;i<38;i++){const age=(time*(.8+(i%4)*.1)+i*.618)%1,side=i%2?1:-1,dx=side*age*(35+i%7*12)*strength,dy=Math.sin(age*Math.PI)*(3+i%6*2)*strength;c.globalAlpha=(1-age)*strength*.6;c.fillStyle='#c5c4b9';c.fillRect(x+dx,ground-dy,1.5,1.5);}c.globalAlpha=1;
    }
    c.save();c.translate(x,y);c.rotate(steer*.45);c.scale(.9*zoom,.9*zoom);
    if(!paused&&s.fuel>0&&throttle>0){
      const length=(18+throttle*55)*(motion?1+Math.sin(time*43)*.06:1),flame=c.createLinearGradient(0,3,0,length);flame.addColorStop(0,'#eff8fff0');flame.addColorStop(.2,'#a6d6ffb0');flame.addColorStop(1,'#558fff00');c.fillStyle=flame;c.beginPath();c.moveTo(-7,0);c.bezierCurveTo(-9,length*.35,-3,length*.8,0,length);c.bezierCurveTo(3,length*.8,9,length*.35,7,0);c.fill();
    }
    c.strokeStyle='#adb8be';c.lineWidth=2;for(const side of [-1,1]){c.beginPath();c.moveTo(side*12,-12);c.lineTo(side*27,1);c.lineTo(side*34,0);c.moveTo(side*13,-3);c.lineTo(side*25,0);c.stroke();c.fillStyle='#b99d62';c.fillRect(side*27-7,-1,14,3);}
    const foil=c.createLinearGradient(-16,-30,16,0);foil.addColorStop(0,'#e2c587');foil.addColorStop(.45,'#b39456');foil.addColorStop(1,'#6f5a36');c.fillStyle=foil;c.fillRect(-16,-33,32,29);c.strokeStyle='#efdaa280';c.lineWidth=.6;for(let i=0;i<4;i++){c.strokeRect(-16+i*8,-33,8,14);c.strokeRect(-16+i*8,-19,8,15);}
    c.fillStyle='#c2ccd2';c.fillRect(-18,-36,36,3);c.fillRect(-18,-6,36,3);c.fillStyle='#202c34';c.fillRect(-9,-39,18,3);
    for(const side of [-1,1]){c.fillStyle='#344c61';c.fillRect(side<0?-51:21,-29,30,14);c.strokeStyle='#7c9fb8';c.lineWidth=.7;for(let i=0;i<5;i++)c.strokeRect((side<0?-51:21)+i*6,-29,6,14);c.strokeStyle='#a9b7bf';c.strokeRect(side<0?-51:21,-29,30,14);}
    c.fillStyle='#1b252e';c.beginPath();c.moveTo(-5,-3);c.lineTo(-8,2);c.lineTo(8,2);c.lineTo(5,-3);c.fill();c.fillStyle='#a0d2e7';c.fillRect(7,-24,6,6);c.fillStyle='#142331';c.fillRect(8,-23,4,4);
    c.strokeStyle='#c0cbd0';c.lineWidth=1.2;c.beginPath();c.moveTo(0,-36);c.lineTo(0,-47);c.stroke();c.fillStyle='#d6d7cd';c.beginPath();c.ellipse(0,-48,11,4,-.2,0,Math.PI*2);c.fill();c.restore();
    // Actual velocity vector; long arrows are clamped for legibility.
    c.strokeStyle='#e7b379';c.lineWidth=1.4;const vx=Math.max(-45,Math.min(45,s.vx*3)),vy=Math.max(-65,Math.min(65,-s.vy*2));c.beginPath();c.moveTo(x,y+8);c.lineTo(x+vx,y+8+vy);c.stroke();
    c.textAlign='left';c.font='12px monospace';c.fillStyle='#c8d4df';c.fillText('LOCAL FRAME / METRES',20,27);c.fillStyle='#9eafbc';c.fillText(`ALT ${s.y.toFixed(1)}   V/S ${s.vy.toFixed(1)}   X ${s.x.toFixed(1)}`,20,47);c.textAlign='right';c.fillText('FLAT LANDING ZONE · SCHEMATIC RELIEF',980,27);
  }
  return {draw,dispose(){disposed=true;earth.onload=null;earth.src='';}};
}
