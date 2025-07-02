let xPos = 0;
let dogImages = [];
let isLoading = false;

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

// Show loading screen
function showLoading() {
    const loading = document.getElementById('loading');
    const btn = document.getElementById('newDogsBtn');
    loading.classList.remove('hidden');
    btn.disabled = true;
    isLoading = true;
}

// Hide loading screen
function hideLoading() {
    const loading = document.getElementById('loading');
    const btn = document.getElementById('newDogsBtn');
    loading.classList.add('hidden');
    btn.disabled = false;
    isLoading = false;
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
                document.querySelectorAll('.img').forEach(img => {
                    img.addEventListener('mouseenter', (e) => {
                        let current = e.currentTarget;
                        gsap.to('.img', {opacity:(i,t)=>(t==current)? 1:0.5, ease:'power3'})
                    });
                    img.addEventListener('mouseleave', (e) => {
                        gsap.to('.img', {opacity:1, ease:'power2.inOut'})
                    });
                });
            }, '-=0.5')

        // Hide loading indicator
        hideLoading();
        
    } catch (error) {
        console.error('Error initializing slider:', error);
        document.getElementById('loading').querySelector('.loading-text').textContent = 'Error loading images. Please refresh.';
    }
}

// Load new dogs function
async function loadNewDogs() {
    if (isLoading) return;
    
    showLoading();
    
    try {
        // Add a small delay to show loading animation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch new dog images
        dogImages = await fetchDogImages(10);
        
        // Update images with smooth transition
        gsap.to('.img', {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                gsap.set('.img', {
                    backgroundImage:(i)=> `url(${dogImages[i]})`,
                    backgroundPosition:(i)=>getBgPos(i),
                });
                gsap.to('.img', {
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power2.inOut'
                });
            }
        });
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading new dogs:', error);
        hideLoading();
    }
}

// Mouse and touch event handlers
function dragStart(e){ 
    if (isLoading) return;
    if (e.touches) e.clientX = e.touches[0].clientX;
    xPos = Math.round(e.clientX);
    gsap.set('.ring', {cursor:'grabbing'})
    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag);
}

function drag(e){
    if (isLoading) return;
    if (e.touches) e.clientX = e.touches[0].clientX;    

    gsap.to('.ring', {
    rotationY: '-=' +( (Math.round(e.clientX)-xPos)%360 ),
    onUpdate:()=>{ gsap.set('.img', { backgroundPosition:(i)=>getBgPos(i) }) }
    });
    
    xPos = Math.round(e.clientX);
}

function dragEnd(e){
    window.removeEventListener('mousemove', drag);
    window.removeEventListener('touchmove', drag);
    gsap.set('.ring', {cursor:'grab'});
}

function getBgPos(i){
return ( 88-gsap.utils.wrap(0,360,gsap.getProperty('.ring', 'rotationY')-180-i*36)/360*100 )+'% 50%';
}

// Event listeners
window.addEventListener('mousedown', dragStart);
window.addEventListener('touchstart', dragStart);
window.addEventListener('mouseup', dragEnd);
window.addEventListener('touchend', dragEnd);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initSlider();
});