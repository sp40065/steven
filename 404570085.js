console.clear();

const global = {
  // DOMCollection to array for easier looping
  children: [].slice.call(document.querySelector('.container').children),
  currentHero: null,
  animating: false,
};

global.children.forEach((c) => {
  c.style.background = `hsl(${Math.random() * 360 | 0}, 50%, 50%)`;
  c.addEventListener('click', (e) => { toggleHeroState(e.target) });
});

function toggleHeroState(newHero) {
  if (global.animating === true) return;
  // if hero item is clicked again, unhero it
  newHero = newHero === global.currentHero ? null : newHero;
  
  animateLayoutChange(newHero, global.currentHero);

  global.currentHero = newHero;
}

function animateLayoutChange(newHero, currentHero) {
  global.animating = true;
  
  // store bounds before css change
  const beforeRects = global.children.map((c) => c.getBoundingClientRect());
  
  // apply css changes
  newHero && newHero.classList.toggle('hero');
  currentHero && currentHero.classList.toggle('hero');
  
  // store bounds after css change
  const afterRects = global.children.map((c) => c.getBoundingClientRect());
  
  // create master timeline
  const tl = new TimelineMax({onComplete: () => {
    // reset transforms on children after animation is complete
    TweenMax.set(global.children, {clearProps: 'transform'});
    
    global.animating = false;
  }});
  
  // tl.timeScale(0.1)
  
  global.children.forEach((c, i) => {
    // get before and after bounds
    const before = beforeRects[i];
    const after = afterRects[i];
    
    // calculate scale/width/height changes based on bounds
    const sx = before.width / after.width;
    const sy = before.height / after.height;
    
    // calculate position/left/top changes based on bounds
    const tx = before.left - after.left + (before.width - after.width) * 0.5;
    const ty = before.top - after.top + (before.height - after.height) * 0.5;
    
    // get the content so we can inverse-scale it (hacky?)
    const content = c.children[0];
    
    // animate!
    tl.from(c, 0.5, {
      ease: Power3.easeOut,
      scaleX: sx, 
      scaleY: sy,
      x: tx,
      y: ty,
      onUpdate: () => {
        TweenMax.set(content, {
          scaleX: 1.0 / c._gsTransform.scaleX,
          scaleY: 1.0 / c._gsTransform.scaleY,
        });
      },
      onComplete: () => {
        TweenMax.set(content, {clearProps: 'transform'});
      }
    }, i * 0.025);
  });
};
