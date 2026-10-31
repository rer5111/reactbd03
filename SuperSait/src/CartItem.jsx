import { useContext, useState } from "react"
import { ThemeContext } from "./ThemeContext"
import { deleteCart, updateCart } from "./api/carts"

export default function CartItem(props){
  const {theme} = useContext(ThemeContext)
  const [amnt, setAmnt] = useState(props.item.amnt)

  async function addAmnt(){
    try{
    await updateCart(props.item.id, {shoeId: props.shoe.id, ownerId: props.userId, amnt: amnt+1});
    setAmnt(amnt+1);
    props.changeTotal(1);
    props.changeCost(props.shoe.cost*(1-props.shoe.global_discount)*(1-props.discount.discount));
    }catch(err){
      if (err.message == "Failed to fetch"){
        props.setError("На данный момент сервер недоступен. Попробуйте позже.")
      }else{
        props.setError(err.message)
      }
    }
  }

  async function removeAmnt(){
    try{
    if (amnt > 1){
    await updateCart(props.item.id, {shoeId: props.shoe.id, ownerId: props.userId, amnt: amnt-1});
    setAmnt(amnt > 1 ? amnt-1 : amnt);
    props.changeTotal(-1);
    props.changeCost(-props.shoe.cost*(1-props.shoe.global_discount)*(1-props.discount.discount));
    }
    }catch(err){
      if (err.message == "Failed to fetch"){
        props.setError("На данный момент сервер недоступен. Попробуйте позже.")
      }
      else{
        props.setError(err.message)
      }
    }
  }

  async function removeFromCart(){
    try{
    await deleteCart(props.item.id);
    props.update();
    }catch(err){
      if (err.message == "Failed to fetch"){
        props.setError("На данный момент сервер недоступен. Попробуйте позже.")
      }
      else{
        props.setError(err.message)
      }
    }
  }
  console.log(props)
  console.log(props.shoe.cost*amnt*(1-props.shoe.global_discount)*(1-props.discount.discount))
  console.log(props.shoe.cost*(1-props.shoe.global_discount))
  return (
    <li
      style={{ 
        borderBottom: '1px solid #ccc', 
        padding: '10px 0', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <span style={{ fontWeight: 'bold' }}>{props.shoe.title}</span>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontWeight: 'bold' }}>{(props.shoe.cost*amnt*(1-props.shoe.global_discount)*(1-props.discount.discount)).toFixed(2)}$</span> 
        <button style={{
              backgroundColor: theme === "dark" ? "#303030": "#a7a7a7", 
              borderColor: theme === "dark" ? "#a8a8a8": "#686868"}}
          onClick={removeFromCart}
        >
          Удалить
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button style={{
              backgroundColor: theme === "dark" ? "#303030": "#a7a7a7", 
              borderColor: theme === "dark" ? "#a8a8a8": "#686868"}}
          onClick={addAmnt}
        >
          +
        </button>
        <span>{amnt}</span>
        <button style={{
              backgroundColor: theme === "dark" ? "#303030": "#a7a7a7", 
              borderColor: theme === "dark" ? "#a8a8a8": "#686868"}}
          onClick={removeAmnt}
        >
          -
        </button>
      </div>
    </li>
  )
}