(function(){
  /* foco: punto donde se centra la cámara (% de la imagen)
     dot:  punto exacto marcado en la imagen, donde late el halo
     zoom: acercamiento (1 = foto a la altura del visor) */
  const lugares = [
    {n:"Al Río",                  nEn:"Al Río",                  d:"El proyecto",        dEn:"The project",        foco:[75.5,55], dot:[75.7,42.4], zoom:1.35},
    {n:"Luna del Río",            nEn:"Luna del Río",            d:"A pasos",            dEn:"Steps away",         foco:[16.5,44], dot:[11.7,37.6], zoom:1.7},
    {n:"Estatua de Sofía Vergara",nEn:"Sofía Vergara statue",    d:"A pasos",            dEn:"Steps away",         foco:[16,62],   dot:[22.7,62.4], zoom:1.7},
    {n:"Canchas deportivas",      nEn:"Sports courts",           d:"Al frente",          dEn:"On the waterfront",  foco:[25,74],   dot:[33.3,75.7], zoom:1.7},
    {n:"Av. del Río",             nEn:"Av. del Río",             d:"Frente al proyecto", dEn:"At the door",        foco:[40.4,63], dot:[40.4,66.9], zoom:1.7},
    {n:"Calle 72",                nEn:"Calle 72",                d:"A una cuadra",       dEn:"One block",          foco:[33.8,40], dot:[33.8,41.3], zoom:1.7},
    {n:"Vía 40",                  nEn:"Vía 40",                  d:"A una cuadra",       dEn:"One block",          foco:[56.4,39], dot:[56.4,41.2], zoom:1.7}
  ];

  const visor=document.getElementById('visor'),capa=document.getElementById('capa'),
        foto=document.getElementById('foto'),halo=document.getElementById('halo'),
        centro=document.getElementById('centro'),puntos=document.getElementById('puntos');
  if(!visor||!capa||!foto||!halo||!centro||!puntos) return;
  let actual=0, ratio=16/9, visible=false;
  const en=()=>document.body.getAttribute('data-lang')==='en';
  const nom=L=>en()?L.nEn:L.n;
  const dis=L=>en()?L.dEn:L.d;

  const lista=document.getElementById('lista');
  lugares.forEach((L,i)=>{
    puntos.appendChild(document.createElement('span'));
    const li=document.createElement('li'), b=document.createElement('button');
    b.className='ubic__item';
    b.innerHTML=`<span class="num">${String(i+1).padStart(2,'0')}</span><span class="txt"><span class="nom"></span><span class="dis"></span></span>`;
    const nomEl=b.querySelector('.nom'), disEl=b.querySelector('.dis');
    nomEl.textContent=L.n; nomEl.setAttribute('data-en',L.nEn); nomEl.dataset.es=L.n;
    disEl.textContent=L.d; disEl.setAttribute('data-en',L.dEn); disEl.dataset.es=L.d;
    b.onclick=()=>ir(i); li.appendChild(b); lista.appendChild(li);
  });
  // Flechas del teclado en escritorio
  addEventListener('keydown',e=>{
    if(!visible)return;
    if(e.key==='ArrowRight'){ e.preventDefault(); ir(actual+1); }
    if(e.key==='ArrowLeft'){ e.preventDefault(); ir(actual-1); }
  });

  // Calcula la posición de cámara para un foco y zoom dados
  function camara(fx,fy,z){
    const W=visor.clientWidth, H=visor.clientHeight;
    if(W/H>1.2) z=Math.max(1,z*.85);                    // en escritorio se acerca un poco menos
    const w=H*ratio*z, h=H*z;
    let x=W/2 - w*fx/100, y=H/2 - h*fy/100;
    x=Math.min(0,Math.max(W-w,x)); y=Math.min(0,Math.max(H-h,y));   // no mostrar bordes
    return `translate(${x}px,${y}px) scale(${z})`;
  }

  let anim=null, previo=null;
  function encuadrar(animar){
    const L=lugares[actual], H=visor.clientHeight;
    capa.style.width=H*ratio+'px'; capa.style.height=H+'px';
    halo.style.left=L.dot[0]+'%'; halo.style.top=L.dot[1]+'%';
    const destino=camara(L.foco[0],L.foco[1],L.zoom);
    const quieto=matchMedia('(prefers-reduced-motion: reduce)').matches;

    if(animar && previo && !quieto){
      const desde=getComputedStyle(capa).transform;
      if(anim) anim.cancel();
      // Distancia del salto: define duración y cuánto se aleja la cámara
      const dx=L.foco[0]-previo.foco[0], dy=L.foco[1]-previo.foco[1];
      const dist=Math.hypot(dx,dy);                       // en % de la imagen
      const dur=Math.min(2600, 1100 + dist*28);
      const cuadros=[{transform:desde}];
      if(dist>15){
        // "Vuelo": se abre un poco en la mitad del recorrido y vuelve a acercarse
        const zMin=Math.min(L.zoom,previo.zoom), alejar=Math.max(1, zMin - Math.min(.55, dist/90));
        cuadros.push({transform:camara((L.foco[0]+previo.foco[0])/2,(L.foco[1]+previo.foco[1])/2,alejar), offset:.5});
      }
      cuadros.push({transform:destino});
      anim=capa.animate(cuadros,{duration:dur, easing:'cubic-bezier(.45,.05,.25,1)'});
    }
    capa.style.transform=destino;
    previo=L;
  }

  function pintarTextos(){
    const L=lugares[actual];
    document.getElementById('nombre').textContent=nom(L);
    document.getElementById('dist').textContent=dis(L);
    lista.querySelectorAll('.ubic__item').forEach((b,j)=>{
      const Lj=lugares[j];
      b.querySelector('.nom').textContent=nom(Lj);
      b.querySelector('.dis').textContent=dis(Lj);
    });
    document.getElementById('prev').setAttribute('aria-label',en()?'Previous place':'Lugar anterior');
    document.getElementById('next').setAttribute('aria-label',en()?'Next place':'Lugar siguiente');
  }

  function ir(i){
    actual=(i+lugares.length)%lugares.length;
    halo.classList.remove('is-on'); void halo.offsetWidth; halo.classList.add('is-on');
    encuadrar(true);
    [...puntos.children].forEach((p,j)=>p.classList.toggle('is-on',j===actual));
    lista.querySelectorAll('.ubic__item').forEach((b,j)=>{b.classList.toggle('is-on',j===actual);b.setAttribute('aria-current',j===actual?'true':'false');});
    centro.classList.remove('entra'); centro.classList.add('sale');
    setTimeout(()=>{
      pintarTextos();
      centro.classList.remove('sale'); void centro.offsetWidth; centro.classList.add('entra');
    },200);
  }

  document.getElementById('prev').onclick=()=>ir(actual-1);
  document.getElementById('next').onclick=()=>ir(actual+1);

  // Deslizar con el dedo sobre la foto
  let x0=null;
  visor.addEventListener('pointerdown',e=>x0=e.clientX);
  visor.addEventListener('pointerup',e=>{ if(x0===null)return; const dx=e.clientX-x0; if(Math.abs(dx)>40) ir(actual+(dx<0?1:-1)); x0=null; });

  // Al cargar: foto completa. Al llegar con el scroll: vuela hacia el proyecto.
  const listo=()=>{
    if(foto.naturalWidth) ratio=foto.naturalWidth/foto.naturalHeight;
    const H=visor.clientHeight;
    capa.style.width=H*ratio+'px'; capa.style.height=H+'px';
    capa.style.transform=camara(50,50,1);
    previo={foco:[50,50],zoom:1};
    pintarTextos();
    let arrancó=false;
    new IntersectionObserver(([e])=>{
      visible=e.isIntersecting;
      if(e.intersectionRatio>=.5 && !arrancó){ arrancó=true; setTimeout(()=>ir(0),250); }
    },{threshold:[0,.5]}).observe(visor);
  };
  foto.complete?listo():foto.addEventListener('load',listo);
  addEventListener('resize',()=>encuadrar(false));
  new MutationObserver(()=>pintarTextos()).observe(document.body,{attributes:true,attributeFilter:['data-lang']});
})();
