import { useContext, useEffect, useState } from "react";
import Product from "./Product"
import {getShoes} from "./api/shoes"
import { getCategories } from "./api/categories";
import { getDiscountByOwnerId } from "./api/discounts";
import { UserContext } from "./UserContext";
export default function Products(){
  const [shoes, setShoes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const {user} = useContext(UserContext);
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  const loadData = async () => {
    try{
      setLoading(true);
      const data_shoes = await getShoes();
      const data_categories = await getCategories();
      if (user != null){
      const data_discounts = await getDiscountByOwnerId(user.id);
      setDiscounts(data_discounts);
      }
      setShoes(data_shoes);
      setCategories(data_categories);
      setError(null);
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

  const handleCheckboxChange = (categoryTitle) => {
    setSelectedCategories(prev => 
        prev.includes(categoryTitle)
            ? prev.filter(c => c !== categoryTitle)
            : [...prev, categoryTitle]
    );
  };

  useEffect(() => {
    if (error == "Failed to fetch"){
      setError("На данный момент сервер недоступен. Попробуйте позже.")
    }
  }, [error])

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
      loadData();
  };

  const filteredShoes = shoes.filter(s => 
    selectedCategories.length === 0 || selectedCategories.includes(categories.find(cat=> cat.id == s.category_id).title)
  );

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

  
  return (
  <div>
    <h1>Магазин ботинок</h1>
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
    <aside style={{ border: '1px solid black', padding: '15px', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h4 style={{ margin: 0, borderBottom: '1px dashed gray', paddingBottom: '5px' }}>Категории:</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {categories.map(cat => (
              <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(cat.title)}
                      onChange={() => handleCheckboxChange(cat.title)}
                  />
                  {cat.title}
              </label>
          ))}
      </div>
    </aside>
    <div className="CardHolder" style={{width:"100%"}}>
      {filteredShoes.map((boot) => {boot.category = categories.find(cat => cat.id == boot.category_id).title;
      boot.local_discount = discounts.find(disc => disc.shoe_id == boot.id) ?? {discount: 0};
      return (
        <Product 
          key={boot.id} 
          boot={boot}
          setError={setError}
          className="ProductCard"
        />
      )})}
    </div>
  </div>
  </div>
  )
}