import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { getShoes } from "./api/shoes";
import { createCategory, deleteCategory, getCategories } from "./api/categories";
import { getDiscountByOwnerId, getDiscounts } from "./api/discounts";
import AdminProduct from "./AdminItem";
import { getUsers } from "./api/users";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [shoes, setShoes] = useState([]);
  const [filteredShoes, setFilteredShoes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [error, setError] = useState(null);
  const [tempError, setTempError] = useState(null)
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const { user } = useContext(UserContext);

  const loadData = async () => {
    try {
      setLoading(true);
      const data_shoes = await getShoes();
      const data_categories = await getCategories();
      const data_discounts = await getDiscounts();
      const data_users = await getUsers();
      
      setShoes(data_shoes);
      setCategories(data_categories);
      setDiscounts(data_discounts);
      setUsers(data_users.filter((user) => user.roleid != 1));
      setError(null);
    }
    catch (err) {
      if (err.message === "Failed to fetch") {
        setError("На данный момент сервер недоступен. Попробуйте позже.");
      } else {
        setError(`Ошибка при загрузке данных: ${err.message}`);
        console.error(`Ошибка при загрузке данных: ${err.message}`);
      }
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = shoes.filter((shoe) => 
      shoe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredShoes(filtered);
  }, [shoes, searchTerm]);

  useEffect(() => {
    if (user == null){
      navigate("/login", {state: {redirect: "/dashboard"}})
    }
    loadData();
  }, []);
  
  function handleRefresh() {
    loadData();
  }

  function handleSearch(e) {
    setSearchTerm(e.target.value);
  }

  async function addCategory(e){
    e.preventDefault()
    try{
    const cat = document.getElementById("createSelection").value
    await createCategory({title: cat})
    loadData()
    }
    catch(err){
      if (err.message === "Failed to fetch") {
        setTempError("На данный момент сервер недоступен. Попробуйте позже.");
      } else {
        setTempError(`Данная категория уже существует!`);
        console.error(`Данная категория уже существует!`);
      }
    }
  }

  async function removeCategory(e){
    e.preventDefault()
    console.log("removin")
    try{
      const cat = JSON.parse(document.getElementById("deleteSelection").value)
      await deleteCategory(cat.id)
      loadData()
    }catch(err){
      if (err.message === "Failed to fetch") {
        setTempError("На данный момент сервер недоступен. Попробуйте позже.");
      } else {
        setTempError("Данная категория еще используется!");
        console.error("Данная категория еще используется!");
      }
    }
  }

  if (user == null){
    return (<h1>Сначала войдите в аккаунт!</h1>)
  }

  if (user.roleid == 2) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Дешборд</h2>
        <p>Добро пожаловать в ваш личный кабинет.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div>Загрузка ботинок...</div>
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

  if (user.roleid == 1) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Панель администратора</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', margin:"20px"}}>
        <form onSubmit={addCategory}>
          <h3>Создание категорий</h3>
          <input type="text" placeholder="Название" id="createSelection"></input>
          <button type="submit">Создать</button>
        </form>
        <form onSubmit={removeCategory}>
          <h3>Удаление категорий</h3>
          <select id="deleteSelection">
            {categories.map((cat => <option value={JSON.stringify(cat)}>{cat.title}</option>))}
          </select>
          <button type="submit">Удалить</button>
        </form>
        <p style={{alignSelf: "anchor-center"}}>{tempError}</p>
        </div>
        <input type="text" placeholder="Поиск" id="search" value={searchTerm} onChange={handleSearch}/>
        <div className="CardHolder">
          {filteredShoes.map((shoe) => {
            shoe.category = categories.find(cat => cat.id == shoe.category_id).title;
            return (<AdminProduct boot={shoe} users={users} discounts={discounts} key={shoe.id} update={loadData} categories={categories}/>)}
          )}
        </div>
      </div>
    );
  }
}