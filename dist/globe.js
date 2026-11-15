// A decorative globe using the NASA SVS texture. It is not a terrain model.
export function mountGlobe(canvas) {
  if(!canvas) return;
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
  if(!gl){canvas.classList.add('globe-fallback'); return;}
  let frame=0,disposed=false,visible=true,loaded=false,time=0,last=0;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;});observer.observe(canvas);
  canvas.releaseGlobe=()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();gl.getExtension('WEBGL_lose_context')?.loseContext();};
  const vertex=`attribute vec2 a; varying vec2 uv; void main(){uv=a;gl_Position=vec4(a,0.,1.);}`;
  const fragment=`precision mediump float; varying vec2 uv; uniform sampler2D tex; uniform float angle; void main(){vec2 p=uv*1.08;float r=dot(p,p);if(r>1.){gl_FragColor=vec4(0.);return;}vec3 n=vec3(p.x,p.y,sqrt(1.-r));float lon=atan(n.x,n.z);float lat=asin(n.y);vec2 t=vec2(fract(lon/6.2831853+0.50+angle),0.5-lat/3.14159265);vec3 c=texture2D(tex,t).rgb;float light=max(0.,dot(n,normalize(vec3(-0.75,0.3,0.75))));c*=0.13+0.95*light;c=pow(c,vec3(.87));float edge=smoothstep(1.,.99,r);gl_FragColor=vec4(c,edge);}`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);return s;}
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const angle=gl.getUniformLocation(program,'angle');
  function draw(now){if(disposed)return;frame=requestAnimationFrame(draw);const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!visible||document.hidden||!loaded||reduced.matches)return;time+=dt;gl.uniform1f(angle,time*.0015);gl.drawArrays(gl.TRIANGLES,0,6);}
  frame=requestAnimationFrame(draw);
  const img=new Image();img.onload=()=>{if(disposed||!canvas.isConnected)return;canvas.width=640;canvas.height=640;gl.viewport(0,0,640,640);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);loaded=true;gl.drawArrays(gl.TRIANGLES,0,6);};img.onerror=()=>canvas.classList.add('globe-fallback');img.src='./assets/moon.jpg';
}
