import { useContext, useEffect, useState } from 'react'
import './App.css'
import { ThemeContext } from './ThemeContext';
import { UserContext } from './UserContext';
import { data, useNavigate } from 'react-router-dom';
import { getCartByOwnerId } from './api/carts';
import { getShoes } from './api/shoes';
import { getCategories } from './api/categories';
import CartItem from './CartItem';
import { getDiscountByOwnerId } from './api/discounts';

export default function Cart() {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [ cart, setCart] = useState([])
  const [ shoes, setShoes] = useState([])
  const [ categories, setCategories] = useState([])
  const [ discounts, setDiscounts] = useState([])
  const {theme} = useContext(ThemeContext);
  const [totalCost, setTotalCost] = useState(0);
  const [total, setTotal] = useState(0);

  const loadData = async () => {
    try{
      setLoading(true);
      const data_shoes = await getShoes();
      const data_categories = await getCategories();
      const data_cart = await getCartByOwnerId(user.id);
      const data_discount = await getDiscountByOwnerId(user.id);
      setShoes(data_shoes);
      setCategories(data_categories);
      setCart(data_cart);
      setDiscounts(data_discount);
      setError(null);
      setTotalCost(data_cart.reduce((sum, item) => {
        const shoe = data_shoes.find(shoe=>shoe.id==item.shoe_id);
        return sum + shoe.cost*item.amnt*(1-shoe.global_discount)*(1-(data_discount.find(disc=> disc.shoe_id == shoe.id) ?? {discount:0}).discount)}, 0));
      setTotal(data_cart.reduce((len, item) => len + item.amnt, 0));
    }
    catch (err) {
      if (err.message === "Failed to fetch"){
        setError("На данный момент сервер недоступен. Попробуйте позже.")
      }
      else{
      setError(`Ошибка при загрузке данных: ${err.message}`);
      console.error(`Ошибка при загрузке данных: ${err.message}`);
      }
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user == null){
      navigate("/login", {state: {redirect: "/cart"}})
    }
    loadData()
  }, [])

  const handleRefresh = () => {
    loadData()
  }

  function changeCost(amnt){
    setTotalCost(totalCost+amnt)
  }

  function changeTotal(amnt){
    setTotal(total+amnt)
  }

  if (user == null){
    return (<h1>Сначала войдите в аккаунт!</h1>)
  }
  if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <div>Загрузка корзины...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ color: 'red', padding: '20px' }}>
                <div>Ошибка: {error}</div>
                <button 
                    onClick={handleRefresh}
                    style={{ 
                        marginTop: '10px', 
                        padding: '8px 16px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Корзина</h2>
      {cart.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <div>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {cart.map((item, index) => {
              const shoe = shoes.find(shoe=> {return shoe.id == item.shoe_id});
              return (<CartItem shoe={shoe}
                userId={user.id}
                item={item}
                discount={discounts.find(disc => disc.shoe_id == shoe.id) ?? {discount:0}}
                update={loadData}
                changeCost={changeCost}
                changeTotal={changeTotal}
                setError={setError}
                key={index}>
              </CartItem>)})}
          </ul>
          
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #333', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
            <span>Всего товаров: <strong>{total}</strong></span>
            <span>Итого: <strong>{totalCost.toFixed(2)}$</strong></span>
          </div>
        </div>
      )}
    </div>
  )
}