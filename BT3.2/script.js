let xPos = 0;
let dogImages = [];

// Function to fetch random dog images
async function fetchDogImages(count = 10) {
    const images = [];
    const promises = [];
    
    for (let i = 0; i < count; i++) {
        promises.push(
            fetch('https://dog.ceo/api/breeds/image/random')
                .then(response => response.json())
                .then(data => data.message)
        );
    }
    
    try {
        const results = await Promise.all(promises);
        return results;
    } catch (error) {
        console.error('Error fetching dog images:', error);
        // Fallback to placeholder images if API fails
        return Array.from({length: count}, (_, i) => `https://picsum.photos/id/${i+32}/600/400/`);
    }
}

// Initialize the slider
async function initSlider() {
    try {
        dogImages = await fetchDogImages(10);
        
        gsap.timeline()
            .set('.ring', { rotationY:180, cursor:'grab' })
            .set('.img',  {
                rotateY: (i)=> i*-36,
                transformOrigin: '50% 50% 500px',
                z: -500,
                backgroundImage:(i)=> `url(${dogImages[i]})`,
                backgroundPosition:(i)=>getBgPos(i),
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backfaceVisibility:'hidden'
            })    
            .from('.img', {
                duration:1.5,
                y:200,
                opacity:0,
                stagger:0.1,
                ease:'expo'
            })
            .add(()=>{
                $('.img').on('mouseenter', (e)=>{
                    let current = e.currentTarget;
                    gsap.to('.img', {opacity:(i,t)=>(t==current)? 1:0.5, ease:'power3'})
                })
                $('.img').on('mouseleave', (e)=>{
                    gsap.to('.img', {opacity:1, ease:'power2.inOut'})
                })
            }, '-=0.5')

        // Hide loading indicator
        $('#loading').addClass('hidden');
        
    } catch (error) {
        console.error('Error initializing slider:', error);
        $('#loading').text('Error loading images. Please refresh.');
    }
}

$(window).on('mousedown touchstart', dragStart);
$(window).on('mouseup touchend', dragEnd);

function dragStart(e){ 
    if (e.touches) e.clientX = e.touches[0].clientX;
    xPos = Math.round(e.clientX);
    gsap.set('.ring', {cursor:'grabbing'})
    $(window).on('mousemove touchmove', drag);
}

function drag(e){
  if (e.touches) e.clientX = e.touches[0].clientX;    

  gsap.to('.ring', {
    rotationY: '-=' +( (Math.round(e.clientX)-xPos)%360 ),
    onUpdate:()=>{ gsap.set('.img', { backgroundPosition:(i)=>getBgPos(i) }) }
  });
  
  xPos = Math.round(e.clientX);
}

function dragEnd(e){
  $(window).off('mousemove touchmove', drag);
  gsap.set('.ring', {cursor:'grab'});
}

function getBgPos(i){
  return ( 50-gsap.utils.wrap(0,360,gsap.getProperty('.ring', 'rotationY')-180-i*36)/360*100 )+'% 50%';
}

// Initialize when page loads
$(document).ready(() => {
    initSlider();
});