
import {useEffect,useState,useContext} from 'react';
import PropTypes from 'prop-types';
import {Stack,VStack,useColorMode,Table,Thead,Tbody,Tr,Th,Td,Button,Flex,useToast} from '@chakra-ui/react';
import CardBody from "components/Card/CardBody.js";
import { RiDeleteBinLine } from "react-icons/ri";
import { Loading } from "components/Loading/Loading.js";
import api from 'utils/customFetch';
import {PaymentAlertCardContext} from './PaymentAlertCardContext';

const PaymentAlertCardMessage = ({userGroup}) => {
    
    const [loading,SetLoading] = useState("");
    const { colorMode } = useColorMode();
    const toast = useToast();
    const {paymentAlerts,SetPaymentAlerts,fetchPaymentAlerts} = useContext(PaymentAlertCardContext);

     useEffect(async () => {
            try{
                SetLoading(true);
                await fetchPaymentAlerts(userGroup);
            }catch(error)
            {
                console.error(error);
                toast({
                title: "Error fetching payment alerts",
                status: "error",
                duration: 5000,
                isClosable: true,
                });
            }finally{
                SetLoading(false);
            }
        }, []);

    const handleDelete = async (id) => {
      try {
        await api().delete("/admin/deletepaymentalert/"+id);
        SetPaymentAlerts(
          paymentAlerts.filter(paymentAlert => paymentAlert._id !== id)
        );
      } catch (error) {
        console.error(error);
        toast({
          title: "Error deleting payment alert",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }finally{
      }
    }

    return (
        <div className='payment-card-body custom-card-body'>
            <CardBody>
                <Flex
                flexWrap="wrap"
                flexDirection={{ base: "column", sm: "row" }}
                justifyContent="flex-start"
                width="100%"
                >
                <Stack
                    spacing={1}
                    borderRadius="3px"
                    m="5px"
                    boxShadow="0px 0px 2px white"
                    width="100%"
                >
                    <VStack spacing={3} align="stretch">
                    <Table variant="striped">
                        <Thead>
                        <Tr>
                            {
                                userGroup == "admin" && <Th>Company Name</Th>
                            }
                            <Th>Message</Th>
                            {
                                userGroup == "subadmin" &&  <Th>Date</Th>
                            }
                            {
                                userGroup == "admin" &&  <Th>Action</Th>
                            }
                        </Tr>
                        </Thead>
                        {
                            loading? (
                            <Tbody>
                                <Tr>
                                <Td colSpan={5}>
                                    <Loading />
                                </Td>
                                </Tr>
                            </Tbody>
                            ): (
                            <Tbody>
                                {paymentAlerts.map((item) => {
                                    return (
                                    <Tr key={item._id}>
                                        {
                                            userGroup == "admin" && <Td>
                                                {item.company}
                                            </Td>
                                        }
                                        <Td>{item.message}</Td>
                                        {
                                            userGroup == "subadmin" && <Td>
                                                {new Date(item.date).toLocaleDateString()}
                                            </Td>
                                        }
                                        {
                                            userGroup == "admin" &&  <Td>
                                                <Button
                                                    className="tableInterBtn"
                                                    size="sm"
                                                    onClick={() => handleDelete(item._id)}
                                                    bg={
                                                    colorMode === "light" ? "red.600" : "blue.300"
                                                    }
                                                    _hover={{
                                                    bg:
                                                        colorMode === "light"
                                                        ? "red.300"
                                                        : "blue.200",
                                                    }}
                                                >
                                                    <RiDeleteBinLine size={14} color="white" />
                                                </Button>
                                            </Td>
                                        }
                                    </Tr>
                                    );
                                })}
                                </Tbody>
                            )
                        }
                    </Table>
                    </VStack>
                </Stack>
                </Flex>
            </CardBody>
        </div>
    )
};

PaymentAlertCardMessage.propTypes = {
    userGroup:PropTypes.string
};

PaymentAlertCardMessage.defaultProps = {
    userGroup:"admin"
}

export default PaymentAlertCardMessage;