import PaymentAlertParent from "components/PaymentAlert/PaymentAlert";

const PaymentAlertManagement = () => {
    return (
       <PaymentAlertParent userGroup="subadmin" showForm={false} showMessages={true} />
    )
};

export default PaymentAlertManagement;