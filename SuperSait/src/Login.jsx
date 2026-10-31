import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { attemptLogin, createUser } from "./api/users";

export default function Login() {
  const location = useLocation();
  console.log(location)
  const {redirect} = location.state || {};
  console.log(redirect)
  const navigate = useNavigate();
  const {user, setUser} = useContext(UserContext);
  const [message, setMessage] = useState("");
  const [registerMode, setRegisterMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try{
    if (!registerMode){
    const response = await attemptLogin(document.getElementById("login").value, document.getElementById("pass2").value)
    console.log(response)
    if ("message" in response){
      console.log(response.message);
      setMessage(response.message);
    }else{
      delete response["pass"]
      setUser(response);
      localStorage.setItem("user", JSON.stringify(response))
      navigate(redirect ?? "/dashboard", {replace: true});
    }
  }
  else{
    const pass = document.getElementById("pass").value;
    const pass2 = document.getElementById("pass2").value;
    const login = document.getElementById("login").value;
    if (pass.length < 8){
      setMessage("Пароль должен состоять из 8 или более символов!")
      return
    }
    else if (pass.toUpperCase() == pass || pass.toLowerCase() == pass){
      setMessage("Пароль должен состоять из хотябы одной прописной и одной строчной буквы!")
      return
    }
    else if (!(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].some(str=>pass.includes(str)))){
      setMessage("Пароль должен содержат хотябы одну цифру!")
      return
    }
    if (!(login.includes('@') && login.includes('.'))){
      setMessage("Логин должен содержать действительную электронную почту!")
      return
    }
    if (pass != pass2){
      setMessage("Пароли должны совпадать!");
      return
    }
    const response = await createUser({email: document.getElementById("login").value, pass: document.getElementById("pass").value, roleID: 2})
    if ("error" in response){
      console.log(response.error)
      setMessage(response.error)
    }
    else{
    console.log(response);
    setRegisterMode(false);
    setMessage("Аккаунт успешно создан. Теперь вы можете войти в аккаунт.")
    }
  }
  }
  catch (err){
    if (err.message === "Failed to fetch"){
        setMessage("На данный момент сервер недоступен. Попробуйте позже.")
      }
      else{
      setMessage(`Ошибка: ${err.message}`);
      console.error(`Ошибка: ${err.message}`);
      }
  }
  }

  return (
    <div style={{ padding: "40px", textStyle: "center" }}>
      {registerMode ? <h2>Регистрация</h2> : <h2>Авторизация</h2>}
      {message}
      <form onSubmit={handleLogin}>
        {registerMode ? 
        <div>
          <input type='email' id="login" placeholder="Логин" onChange={()=>{setMessage("")}}/>
          <input type='text' id="pass" placeholder="Пароль" onChange={()=>{setMessage("")}} style={{marginLeft:"10px"}}/>
          <input type='password' id="pass2" placeholder="Повторите пароль" onChange={()=>{setMessage("")}} style={{marginLeft:"10px"}}/>
        </div>:
        <div>
          <input type='email' id="login" placeholder="Логин" onChange={()=>{setMessage("")}}/>
          <input type='password' id="pass2" placeholder="Пароль" onChange={()=>{setMessage("")}} style={{marginLeft:"10px"}}/>
        </div>}
        <div />
        <button type="submit">
          {registerMode ? <p>Зарегестрироваться</p> : <p>Войти</p>}
        </button>
      </form>
      {registerMode ? <div><p>Уже есть аккаунт?</p> <button onClick={() => {setRegisterMode(false); console.log(registerMode)}}>Войти</button></div> :
      <div><p>Нет аккаунта?</p><button onClick={() => {setRegisterMode(true); console.log(registerMode)}}>Зарегестрироваться</button></div>}
    </div>
  );
}