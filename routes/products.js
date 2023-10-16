const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

// Create a new product (C)
router.get('/new', isLoggedIn, (req, res) => {
    res.render('products/addProduct'); // Render the addnew-product view
});
router.post('/new', isLoggedIn, async (req, res, next) => {
  const { imagePath, title, description, price } = req.body;
  const users = req.user; // Assuming you have user data in the request

  try {
    const product = new Product({
      imagePath,
      title,
      description,
      price,
      users: users._id // Associate the product with the current user
    });

    await product.save();
    req.session.successMessage = ' Created successfully';
    res.redirect('/products/list');
  } catch (error) {
    next(error);
  }
});

// Display a list of products (R)
router.get('/list',isLoggedIn, async (req, res, next) => {
    try {
      const products = await Product.find(); // Fetch products from the database
  
      res.render('products/list', { products }); // Render the HBS template with the products data
    } catch (error) {
      next(error);
    }
  });

//edit
  router.get('/:id/edit', isLoggedIn, async (req, res, next) => {
    const productId = req.params.id;
  
    try {
      const product = await Product.findById(productId);
      if (!product) {
        // Handle the case where the product is not found
        // You can redirect to an error page or the product list
        res.redirect('/products/list');
        return;
      }
  
      res.render('products/editProduct', { product });
    } catch (error) {
      next(error);
    }
  });

  // Update product route
router.put('/:id', isLoggedIn, async (req, res, next) => {
    const { imagePath, title, description, price } = req.body;
    const productId = req.params.id;
  
    try {
      await Product.findByIdAndUpdate(productId, { imagePath, title, description, price });
      req.session.successMessage = ' Updated successfully';
      res.redirect('/products/list'); // Redirect after updating the product
    } catch (error) {
      next(error);
    }
  });


 //Delete
 router.delete('/:id', async (req, res, next) => {
  const productId = req.params.id;

  try {
      // Use your Mongoose model to find and remove the product by its ID
      await Product.findByIdAndRemove(productId);
      req.session.successMessage = ' Deleted successfully';
      res.redirect('/products/list'); // Redirect after deleting the product
  } catch (error) {
      next(error);
  }
});
  module.exports = router;


  function isLoggedIn(req, res, next){
      if(req.isAuthenticated()){
          return next();
      }
      res.redirect('/');
  }