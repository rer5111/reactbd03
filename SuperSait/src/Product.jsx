import { useParams, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { createCart } from "./api/carts";
import { UserContext } from "./UserContext";

export default function Product(props) {
    const { id: routeId } = useParams();
    const currentId = props.id || routeId; 
    const data = props.boot;
    console.log("creating a productCard")
    console.log(data)
    const discounts = [];
    discounts.push(data.global_discount);
    discounts.push(data.local_discount.discount);

    const { theme } = useContext(ThemeContext);
    const { user} = useContext(UserContext)
    const navigate = useNavigate();

    async function handleAdd() {
        if (user == null){
            navigate("/login", {state: {redirect: "/"}})
        }
        try{
            await createCart({ 
                shoeId: data.id,
                ownerId: user.id,
                amnt: 1
        });
        navigate("/cart");
        }catch(e){
            console.log("error adding")
            console.error(e)
            props.setError(e.message);
        }
    }

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
            {data.global_discount != 0 || data.local_discount.discount != 0 ? <div><div style={{display:"flex", flexDirection:"row", justifySelf:"center"}}>
                <h2 style={{textDecoration:"line-through", marginRight:"20px"}}>{data.cost}$</h2>
                {discounts.map(disc => {if (disc != 0) {return <h2 style={{color:"crimson", marginLeft:"10px"}}>-{((disc)*100).toFixed(0)}%</h2>}})}
                </div>
                <h2 style={{color:"crimson"}}>{(data.cost*(1-discounts[1])*(1-discounts[0])).toFixed(2)}$</h2>
                </div>
                :
                <h2>{data.cost}$</h2>}
            <h3>{data.category}</h3>
            <div class="center"><img src={data.img} alt={data.title} /></div>
            <div class="center"><button onClick={handleAdd}>В корзину</button></div>
        </div>
    );
}