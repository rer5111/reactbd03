import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";
import { createCart } from "./api/carts";
import { UserContext } from "./UserContext";
import { updateShoe } from "./api/shoes";
import { createDiscount, updateDiscount } from "./api/discounts";

export default function AdminProduct(props) {
    const currentId = props.boot.id;
    const data = props.boot;
    const users = props.users;
    const [discounts, setDiscounts] = useState(props.discounts);
    const [globalDiscount, setGlobalDiscount] = useState(props.boot.global_discount || 0);
    const [categories, setCategories] = useState(props.categories || "");
    const [category, setCategory] = useState(props.boot.category || "");

    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        setGlobalDiscount(props.boot.global_discount || "");
    }, [props.boot.global_discount]);

    useEffect(() => {
        setDiscounts(props.discounts || "");
    }, [props.discounts]);

    useEffect(() => {
        setCategories(props.categories || "");
    }, [props.categories]);

    useEffect(() => {
        setCategory(props.boot.category || "");
    }, [props.boot.category]);
    
    async function addGlobal(){
        var boot = {
            title: props.boot.title,
            cost: props.boot.cost,
            categoryId: props.boot.category_id,
            globalDiscount: globalDiscount,
            img: props.boot.img
        };
        try{
            await updateShoe(props.boot.id, boot)
            props.update()
        }catch(e){
            console.log(e)
        }
    }

    async function addLocal(){
        var discount = {
            ownerId: JSON.parse(document.getElementById(props.boot.id + "selected_user").value).id,
            shoeId: props.boot.id,
            discount: globalDiscount
        };
        try {
            console.log(discounts)
            console.log(discount)
        if (discounts.some((disc) => disc.owner_id == discount.ownerId && disc.shoe_id == discount.shoeId)){
            console.log("discount found")
            await updateDiscount(discounts.find((disc) => disc.owner_id == discount.ownerId && disc.shoe_id == discount.shoeId).id, discount);
            props.update()
        }
        else{
            console.log("discount not found")
            await createDiscount(discount)
            props.update();
        }}
        catch(e){
            console.log(e)
        }
    }

    function userChanged(){
        const selected_user = JSON.parse(document.getElementById(props.boot.id + "selected_user").value)
        var discount = discounts.find((discount) => discount.owner_id == selected_user.id && discount.shoe_id == props.boot.id)
        if (discount != null){
            discount = parseInt(discount.discount*100)+"%"
        }
        document.getElementById(props.boot.id + "local_discount").textContent = discount ?? "0%"
    }

    function discount_change(new_val){
        const discount = document.getElementById(props.boot.id + "discount_input");
        if (new_val > 1){
            discount.value = 100;
            new_val = 1
        }
        else if (new_val < 0){
            discount.value = 0;
            new_val = 0
        }
        setGlobalDiscount(new_val)
    }

    async function edit_category(){
        const categor = JSON.parse(document.getElementById(props.boot.id + "category_edit").value);
        console.log(categor)
        setCategory(categor);
        var boot = {
            title: props.boot.title,
            cost: props.boot.cost,
            categoryId: categor.id,
            globalDiscount: props.boot.global_discount,
            img: props.boot.img
        };
        await updateShoe(props.boot.id, boot);
        props.update()
    }

    useEffect(() => {
    userChanged();
  }, []);
    return (
        <div style={{
            backgroundColor: theme === "dark" ? "#6b6375" : "#c2baba",
            borderRadius: "5px",
            borderColor: theme === "dark" ? "darkblue" : "lightblue",
            borderWidth: "10px",
            borderStyle: "solid",
            margin: "10px",
            alignItems: "anchor-center"
        }}>
            <h1>{data.title || `Товар с id: ${currentId}`}</h1>
            {data.global_discount != 0 ? <div><div style={{display:"flex", flexDirection:"row", justifySelf:"center"}}>
                <h2 style={{textDecoration:"line-through", marginRight:"20px"}}>{data.cost}$</h2>
                <h2 style={{color:"crimson", marginLeft:"10px"}}>-{parseInt((props.boot.global_discount)*100)}%</h2>
                </div>
                <h2 style={{color:"crimson"}}>{(data.cost*(1-props.boot.global_discount)).toFixed(2)}$</h2>
                </div>
                :
                <h2>{data.cost}$</h2>}
            <h3>{data.category}</h3>
            <div class="center"><img src={data.img} alt={data.title} /></div>
            <div class="center"><h2>Текущая глобальная скидка: </h2>{parseInt(props.boot.global_discount*100)}%<h2 id={props.boot.id + "global_discount"}></h2></div>
            <div class="center"><h2>Скидка выбранного пользователя: </h2><h2 id={props.boot.id + "local_discount"}></h2></div>
            <div class="center"><input type="number" placeholder="Скидка" id={props.boot.id + "discount_input"} onChange={(e) => discount_change(e.target.value/100)}></input></div>
            <div class="center"><button onClick={addGlobal}>Сделать общей</button></div>
            <div class="center">
                <select id={props.boot.id + "selected_user"} onChange={userChanged}>
                    {users.map((user) => <option value={JSON.stringify(user)} key={user.id}>{user.email}</option>)}
                </select>
                <button onClick={addLocal}>Дать пользователю скидку</button>
            </div>
            <div class="center">
            <select id={props.boot.id + "category_edit"}>
                {categories.map((cat) => <option value={JSON.stringify(cat)} key={cat.id} selected={props.boot.id == cat.id}>{cat.title}</option>)}
            </select>
            <button onClick={edit_category}>Изменить категорию</button>
            </div>
        </div>
    );
}