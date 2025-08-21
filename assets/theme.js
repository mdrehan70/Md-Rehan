document.addEventListener('DOMContentLoaded', function() {
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  const popup = $('#popupContainer');

  const fallbackImage = 'https://cdn.shopify.com/s/files/1/0588/2773/5173/files/product-1.png?v=1755600780';
  const fallbackTitle = 'Product';
  const fallbackPrice = 0;

  const money = (cents) => {
    const n = (cents || 0)/100;
    return new Intl.NumberFormat(undefined, {
      style:'currency',
      currency: Shopify?.currency?.active || 'USD'
    }).format(n);
  };

  const safeParse = (json) => {
    try { return JSON.parse(json); } catch(e){ return null; }
  };

  function openProductPopup(product, productId) {
    console.clear();
    console.log('Attempting to load product ID:', productId);
    console.log('Product raw data:', product);

    if(!product) {
      console.warn('Product data missing, showing fallback.');
      product = {
        featured_image: fallbackImage,
        title: fallbackTitle,
        description: '',
        price: fallbackPrice,
        options: [],
        variants: [{ id: null }]
      };
    }

    if(!product.featured_image) console.warn('Missing featured_image for product ID:', productId);
    if(!product.title) console.warn('Missing title for product ID:', productId);
    if(!product.variants || product.variants.length === 0) console.warn('No variants for product ID:', productId);

    let optsHTML = '';
    (product.options || []).forEach(opt => {
      if(/color/i.test(opt.name)){
        optsHTML += `<div class="popup-colors"><p>${opt.name}:</p><div class="color-buttons">`;
        opt.values.forEach((v,i) => {
          optsHTML += `<button class="${i===0?'active':''}">${v}</button>`;
        });
        optsHTML += `</div></div>`;
      } else if(/size/i.test(opt.name)){
        optsHTML += `<div class="popup-sizes"><p>${opt.name}:</p>
          <select id="product-size">
            <option disabled selected>Choose your size</option>`;
        opt.values.forEach(v => {
          optsHTML += `<option value="${v}">${v}</option>`;
        });
        optsHTML += `</select></div>`;
      } else {
        optsHTML += `<div><p>${opt.name}:</p><div>`;
        opt.values.forEach(v => { optsHTML += `<span>${v}</span>`; });
        optsHTML += `</div></div>`;
      }
    });

    $('.popup-left img').src = product.featured_image || fallbackImage;
    $('#popupTitle').textContent = product.title || fallbackTitle;
    $('#popupPrice').textContent = money(product.price || fallbackPrice);
    $('#popupDesc').textContent = product.description || '';
    $('#popupOptions').innerHTML = optsHTML;

    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';

    $$('.popup-colors button', popup).forEach(p => p.addEventListener('click', () => {
      $$('.popup-colors button', popup).forEach(pp => pp.classList.remove('active'));
      p.classList.add('active');
    }));

    // ADD TO CART LOGIC
    $('.add-to-cart', popup).onclick = async () => {
      try {
        // User selections
        const selectedColor = $('.popup-colors button.active', popup)?.textContent?.trim();
        const selectedSize = $('#product-size', popup)?.value;

        let chosenVariant = product.variants[0];
        if (product.variants && product.variants.length > 0) {
          chosenVariant = product.variants.find(v => {
            const matchesColor = selectedColor ? v.option1 === selectedColor : true;
            const matchesSize = selectedSize && selectedSize !== 'Choose your size'
              ? (v.option2 === selectedSize || v.option1 === selectedSize)
              : true;
            return matchesColor && matchesSize;
          }) || product.variants[0];
        }

        if (!chosenVariant || !chosenVariant.id) {
          alert('Variant not available!');
          return;
        }

        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{ id: chosenVariant.id, quantity: 1 }]
          }),
        });

        popup.classList.remove('active');
        setTimeout(() => popup.classList.add('hidden'), 300);
        document.body.style.overflow = '';
        // alert(" Product added to cart!");
        const toast = document.getElementById("cart-toast");
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);

      } catch (err) {
        alert('Could not add to cart');
        console.error(err);
      }
    };
  }

  document.addEventListener('click', function(e){
    const btn = e.target.closest('.plus-btn');
    if(btn){
      const productId = btn.dataset.quickview;
      const script = document.getElementById(`qv-${productId}`);
      const product = safeParse(script?.textContent);
      if(!product) console.warn(`Product ID ${productId} JSON missing or invalid.`);
      openProductPopup(product, productId);
      return;
    }

    if(e.target.closest('#popupContainer .close-btn') || e.target.id==='popupContainer'){
      popup.classList.remove('active');
      setTimeout(() => popup.classList.add('hidden'), 300);
      document.body.style.overflow = '';
      return;
    }
  });

  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeMenu = document.querySelector(".close-menu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.remove("hidden");
      mobileMenu.classList.add("active");
    });

    if (closeMenu) {
      closeMenu.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
        mobileMenu.classList.add("hidden");
      });
    }
  }
});
