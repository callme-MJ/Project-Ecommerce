var express = require('express');
const { response, resource } = require('../app');
var router = express.Router();
var productHelper =require('../helpers/product-helpers');
const { getTotalAmount } = require('../helpers/user-helpers');
var userHelper=require('../helpers/user-helpers')
const verifyLogin =(req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async function(req, res, next) {
  let userl=req.session.user
  //console.log(userl);
  let cartCount =null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  productHelper.putProducts().then((products)=>{
    res.render('user/show-products', { products,user:true, userl, cartCount});

  })

});

router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }
  else{
  res.render('user/userlogin',{user:true,"loginErr":req.session.userLoginErr})}
  req.session.userLoginErr=false
})
router.get('/signup',(req,res)=>{
  res.render('user/signup',{user:true})
})
router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((response)=>{
    //console.log(response);
    req.session.user=response
    req.session.user.loggedIn=true
    
    res.redirect('/')
  })
})
router.post('/login',(req,res)=>{
  // console.log(req.body);
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){ 
      req.session.user=response.user
      req.session.user.loggedIn=true
      res.redirect('/') 
     }else{
       req.session.userLoginErr=true
       res.redirect('/login')
     } 
   })
})
router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelper.getCartProducts(req.session.user._id)
  // console.log(products);
  let total=0
  if(products.length>0){
    total = await userHelper.getTotalAmount(req.session.user._id)}
    let userl=req.session.user
  res.render('user/cart',{user:true,products,userl,total})
  // console.log(userl);
})
 

  router.get('/add-to-cart/:id',(req,res)=>{
  userHelper.addToCart(req.session.user._id,req.params.id).then(()=>{
    //res.redirect('/')
    console.log('apicall');
    res.json({status:true})
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  userHelper.changeProductQuantity(req.body).then(async(response)=>{
    response.total= await userHelper.getTotalAmount(req.session.user._id)
    res.json(response)

  })

})
router.post('/remove-item',(req,res,next)=>{
  userHelper.removeItem(req.body).then((response)=>{
    res.json(response)
  })
})
router.get('/place-order',verifyLogin,async(req,res)=>{
  let products=await userHelper.getCartProducts(req.session.user._id)
  let total= await userHelper.getTotalAmount(req.session.user._id)
  cartCount=await userHelper.getCartCount(req.session.user._id)
  res.render('user/checkout',{user:true,userl:req.session.user,total,products,cartCount})
})
router.get('/edit-cart',(req,res)=>{
  res.redirect('/cart')
})
// router.get('/edit-cart',verifyLogin,async(req,res)=>{
//   let products=await userHelper.getCartProducts(req.session.user._id)
//   let total= await userHelper.getTotalAmount(req.session.user._id)
//   res.render('user/cart',{user:true,userl:req.session.user,total,products})
// })
router.post('/place-order',async(req,res)=>{
  let products=await userHelper.getCartProductsList(req.session.user._id)
  let totalAmount= await userHelper.getTotalAmount(req.session.user._id)
  userHelper.placeOrder(req.body,products,totalAmount).then((response)=>{
    res.json({status:true})

  })
  // console.log(req.body)
})
module.exports = router;
