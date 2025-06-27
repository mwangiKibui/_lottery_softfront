import theme from "theme/themeHome";
import {  ChakraProvider } from "@chakra-ui/react";
import CustomNavbar from "components/CustomNavbar/CustomNavbar";
import HeroSection from "components/Hero/Hero";
import Functionalities from "components/Functionalities/Functionalities";
import PricingPlan from "components/PricingPlan/PricingPlan";
import CustomFooter from "components/CustomFooter/CustomFooter";

const Home = () => {
    return (
        <ChakraProvider theme={theme} resetCss={false} w='100%'>
          
             <CustomNavbar 
                navbarBrand = "LotterySoft"
                navbarBrandUrl = "/"
                centerLinks = {
                    [
                        {
                            text:"Home",
                            url:"home"
                        },
                        {
                            text:"Features",
                            url:"features"
                        },
                        {
                            text:"Pricing",
                            url:"pricing"
                        },
                        {
                            text:"About Us",
                            url:"contact"
                        },
                        {
                            text:"Contact",
                            url:"contact"
                        }
                    ]
                }
                rightLinks = {
                    [
                        {
                            text:"Login",
                            url:"/auth/signin"
                        }
                    ]
                }
             />
            <section id="home">
                <HeroSection/>
            </section>
            <section id="features">
                <Functionalities/>    
            </section>
            
            <section id="pricing">
                <PricingPlan/>
            </section>
            
            <section id="contact">
                <CustomFooter/>
            </section>
            
        </ChakraProvider>
        
    )
};

export default Home;