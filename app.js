//variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
// console.log('cartBtn: ', cartBtn);
// console.log('closeCartBtn: ', closeCartBtn);
// console.log('clearCartBtn: ', clearCartBtn);
// console.log('cartDOM: ', cartDOM);
// console.log('cartOverlay: ', cartOverlay);
// console.log('cartItems: ', cartItems);
// console.log('cartTotal: ', cartTotal);
// console.log('cartContent: ', cartContent);
// console.log('productsDOM: ', productsDOM);

// cart
let cart = [];
let buttonsDOM = [];

// getting the products
class Products {
  async getProducts() {
    console.log('getProducts')
    try {
      const response = await fetch('products.json');
      console.log('response: ', response);
      const data = await response.json();
      console.log('data: ', data);
      let products = data.items;
      console.log('products 1: ', products);
      products = products.map((product) => {
        const { title, price } = product.fields;
        const { id } = product.sys;
        const image = product.fields.image.fields.file.url;
        return { title, price, id, image }
      })
      console.log('products 2: ', products);
      return products;
    } catch (error) {
      console.log(error);
    }
  }

}


// display products
class UI {
  displayProducts(products) {
    console.log('UI displayProducts products: ', products);
    let result = '';
    products.forEach((product) => {
      const { id, title, price, image } = product;
      result += `
      <article class="product">
        <div class="img-container">
          <img src=${image} alt=${title} class="product-img">
          <button class="bag-btn" data-id=${id}>
            <i class="fas fa-shopping-cart"></i>
            add to bag
          </button>
        </div>
        <h3>${title}</h3>
        <h4>$${price}</h4>
      </article>
      `
      productsDOM.innerHTML = result;
    })
  }

  getBagButtons(products) {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    console.log('buttons: ', buttons)
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      console.log('getBagButtons id: ', id);
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = 'In Cart';
        button.disabled = true;
      }
      button.addEventListener('click', (event) => {
        event.target.innerText = 'In Cart';
        event.target.disabled = true;
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 }
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();
      })
    })
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;

    cart.forEach((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    })

    cartTotal.innerText = tempTotal;
    cartItems.innerText = itemsTotal;
  }
  // display cart item
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item')
    div.innerHTML = `
        <img src=${item.image} alt=${item.title}>

          <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
          </div>

          <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div> 
      `
    cartContent.appendChild(div);
  }
  // show the cart
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }
  // setupAPP
  setupAPP() {
    cart = Storage.getCart();
    if (cart) {
      this.setCartValues(cart);
      this.populateCart(cart);
    }
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);

  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  // hide the cart
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }
  cartLogic() {
    clearCartBtn.addEventListener('click', () => { this.clearCart() });

    cartContent.addEventListener('click', (e) => {
      console.log('cartContent e.target: ', e.target);
      if (e.target.classList.contains('remove-item')) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        console.log('remove-item id: ', id);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList.contains('fa-chevron-up')) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        console.log('fa-chevron-up id: ', id);
        let tempCart = cart.find((item) => item.id === id);
        tempCart.amount = tempCart.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempCart.amount;
      } else if (e.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = e.target;
        let id = lowerAmount.dataset.id;
        console.log('fa-chevron-down id: ', id)
        let tempCart = cart.find((item) => item.id === id);
        tempCart.amount = tempCart.amount - 1;
        if (tempCart.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempCart.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    })
    //end of cartLogic
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class='fas fa-shopping-cart'> add to cart `;
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id)
  }
  // end of UI
}

// local storage
class Storage {
  static saveProducts(products) {
    console.log('Storage saveProducts products: ', products);
    localStorage.setItem('products', JSON.stringify(products));
  }

  static getProduct(id) {
    const products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem('cart') ?
      JSON.parse(localStorage.getItem('cart')) : [];
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const products = new Products();
  const ui = new UI();

  // setupAPP
  ui.setupAPP();

  products.getProducts().then((products) => {
    ui.displayProducts(products);
    Storage.saveProducts(products);
  }).then(() => {
    ui.getBagButtons();
    ui.cartLogic();
  });

})