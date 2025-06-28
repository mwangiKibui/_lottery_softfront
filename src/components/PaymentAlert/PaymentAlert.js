
import PropTypes from 'prop-types';
import Card from "components/Card/Card.js";
import {Flex} from '@chakra-ui/react';
import PaymentAlertForm from './PaymentAlertCardForm';
import PaymentAlertCardMessage from './PaymentAlertCardMessage';
import './PaymentAlertCard.css';
import {PaymentAlertCardContextProvider} from './PaymentAlertCardContext';
const PaymentAlertParent = ({userGroup,showForm,showMessages}) => {
    return (
        <PaymentAlertCardContextProvider>
            <Flex direction="column" justifyContent="center" alignItems="center" width="60%" mx="auto" pt={{ base: "120px", md: "75px" }}>
                
                <Card
                    overflowX={{ sm: "scroll", xl: "hidden" }}
                    p={{ base: "5px", md: "20px" }}
                    width="100%"
                    border={{ base: "none", md: "1px solid gray" }}
                >

                <div className="payment-card-header">
                    <div className="payment-card-header-content">
                        <div className = "cch-title">
                            <div className="cch-title-content">
                                Payment Alerts
                            </div>
                        </div>
                    </div>

                    {
                        showForm && <PaymentAlertForm />
                    }

                    {
                        showMessages && <PaymentAlertCardMessage userGroup={userGroup} />
                    }

                </div>

                </Card>
            </Flex>
        </PaymentAlertCardContextProvider>
    )
};

PaymentAlertParent.propTypes = {
    userGroup:PropTypes.string,
    showForm:PropTypes.bool,
    showMessages:PropTypes.bool
};

PaymentAlertParent.defaultProps = {
    userGroup:"admin",
    showForm:true,
    showMessages:true
};

export default PaymentAlertParent;