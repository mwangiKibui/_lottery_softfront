import {Flex,Text,FormControl,FormLabel,Select,Button,Input} from '@chakra-ui/react';
import React from 'react';
import PropTypes from 'prop-types';
import CardHeader from "components/Card/CardHeader.js";
import './CustomCardHeader.css';

const CustomCardHeader = (
   props
) => {
    return (
        <div className='cch-parent-form-card'>
            <div className='cch-form-card'>
                <div className='cch-title'>
                    <div className='cch-title-content'>
                        {
                            props.title
                        }
                    </div>
                    <div class="cch-title-actions">
                    {
                        props.showHeaderAction && (
                            <button type="button" className="header-action-btn" onClick={props.handleHeaderAction}>
                                <i className='fa fa-plus' />
                            </button>
                        )
                    }
                    </div>
                </div>

                <form className='cch-form' onSubmit={props.handleSearch}>
                        {
                            props.showSellerField && (
                                // <FormControl id="lotteryCategoryName" isRequired px="7px" mt="0px"> 
                   
                                //     <FormLabel mt="0px">Choose Seller</FormLabel>
                                //     <Select
                                //         onChange={(event) =>
                                //         props.setSelectedSellerId(event.target.value)
                                //         }
                                //         width="100%"
                                //         background="#649F9F"
                                //     >
                                //         <option value={""} style={{ backgroundColor: "#e3e2e2" }}>
                                //         Choose Seller
                                //         </option>
                                //         {props.sellerInfo.map((info) => (
                                //         <option
                                //             key={info._id}
                                //             value={info._id}
                                //             style={{ backgroundColor: "#e3e2e2" }}
                                //         >
                                //             {info.userName}
                                //         </option>
                                //         ))}
                                //     </Select>
                                // </FormControl>
                                <>
                                    <label htmlFor="seller">Choose seller</label>
                                    <select name="seller" id="seller" onChange={e => props.setSelectedSellerId(e.target.value)}>
                                        
                                        {
                                            props.showAllInSellerField ? (
                                                <option value="">All</option>
                                            ) : (
                                                <option value=""> Choose seller</option>
                                            )
                                        }
                                        {
                                            props.sellerInfo.map((info) => (
                                                <option value={info._id}>{info.userName}</option>
                                            ))
                                        }
                                        
                                    </select>
                                </>
                            )
                        }

{
                            props.showLotteryField && (
                                // <FormControl id="lotteryCategoryName" isRequired px="7px" mt="0px">
                                //     <FormLabel mt="0px">
                                //         Lottery
                                //     </FormLabel>
                                //     <Select
                                //         onChange={(event) =>
                                //         props.setLotteryCategoryName(event.target.value)
                                //         }
                                //         width="100%"
                                //         background="#649F9F"
                                //     >
                                //         <option value={""} style={{ backgroundColor: "#e3e2e2" }}>
                                //         Choose Lottery
                                //         </option>
                                //         {props.lotteryCategories.map((category) => (
                                //         <option
                                //             key={category._id}
                                //             value={category.lotteryName}
                                //             style={{ backgroundColor: "#e3e2e2" }}
                                //         >
                                //             {category.lotteryName}
                                //         </option>
                                //         ))}
                                //     </Select>
                                // </FormControl>
                                <>
                                <label htmlFor="lotteryCategoryName">Lottery</label>
                                <select name='lotteryCategoryName' id="lotteryCategoryName" onChange={e => props.setLotteryCategoryName(e.target.value)}>
                                    
                                    {
                                        props.showAllInLotteryField ? (
                                            <option value="">All</option>
                                        ):(
                                            <option value=""> Choose Lottery</option>
                                        )
                                    }
                                    {
                                        props.lotteryCategories.map((category) => (
                                            <option value={category.lotteryName}>{category.lotteryName}</option>
                                        ))
                                    }
                                </select>
                                </>
                            )
                        }
                        {
                            props.showFromField && (
                                // <FormControl id="fromDate" isRequired  px="7px" mt="0px">
                                //     <FormLabel mt="0px">
                                //         From
                                //     </FormLabel>
                                //     <Input
                                //         type="date"
                                //         value={props.fromDate}
                                //         onChange={(event) => props.setFromDate(event.target.value)}
                                //         width="100%"
                                //         minWidth="100%"
                                //         background="#649F9F"
                                //     />
                                // </FormControl>
                                <>
                                    <label htmlFor="from">From</label>
                                    <input name="from" type="date" value={props.fromDate} onChange={e => props.setFromDate(e.target.value)} id="from" />
                                </>
                            )
                        }
                        {
                            props.showToDate && (
                                // <FormControl id="toDate" isRequired px="7px" mt="0px">
                                //     <FormLabel mt="0px">
                                //         To
                                //     </FormLabel>
                                //     <Input
                                //         type="date"
                                //         value={props.toDate}
                                //         onChange={(event) => props.setToDate(event.target.value)}
                                //         width="100%"
                                //         minWidth="100%"
                                //         background="#649F9F"
                                //     />
                                // </FormControl>
                                <>
                                 <label htmlFor="to">To</label>
                                 <input name="to" type="date" id="to" value={props.toDate} onChange={e => props.setToDate(e.target.value)}/>
                                </>
                            )   
                        }

                        <button type="submit" className="cc-form-submit">Search</button>


                </form>
            </div>
        </div>
    )
};

CustomCardHeader.propTypes = {
    title: PropTypes.string.isRequired,
    setSelectedSellerId: PropTypes.func,
    sellerInfo: PropTypes.arrayOf(PropTypes.object),
    setLotteryCategoryName: PropTypes.func,
    lotteryCategories: PropTypes.arrayOf(PropTypes.object),
    fromDate: PropTypes.string,
    setFromDate: PropTypes.func.isRequired,
    toDate: PropTypes.string,
    setToDate: PropTypes.func,
    showToDate: PropTypes.bool,
    showSellerField: PropTypes.bool,
    showLotteryField: PropTypes.bool,
    showAllInLotteryField: PropTypes.bool,
    showAllInSellerField: PropTypes.bool,
    showFromField: PropTypes.bool,
    handleSearch: PropTypes.func.isRequired,
    colorMode: PropTypes.string.isRequired,
    showHeaderAction: PropTypes.bool,
    handleHeaderAction: PropTypes.func
};

CustomCardHeader.defaultProps = {
    showToDate: true,
    showSellerField:true,
    showLotteryField:true,
    showFromField:true,
    showHeaderAction:false,
    showAllInLotteryField: false,
    showAllInSellerField: false
}

export default CustomCardHeader;