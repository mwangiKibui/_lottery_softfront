
import { Flex,Stack,VStack,Table,Thead,Tbody,Tr,Th,Td,Button,useColorMode,useToast } from '@chakra-ui/react';
import {useEffect} from 'react';
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import {useState} from 'react';
import api from 'utils/customFetch';
import './PaymentAlertCard.css';
import { RiDeleteBinLine } from "react-icons/ri";
import { Loading } from "components/Loading/Loading.js";

const PaymentAlertCard = () => {

    const [company,SetCompany] = useState("");
    const [message,SetMessage] = useState("");
    const [date,SetDate] = useState("");
    const [loading,SetLoading] = useState("");
    const [submitLabel,SetSubmitLabel] = useState("Send");
    const [paymentAlerts,SetPaymentAlerts] = useState([]);
    const toast = useToast();
    

    useEffect(async () => {
      const fetchPaymentAlerts = async () => {
      try {
        SetLoading(true);
        const response = await api().get("/admin/getpaymentalert");
        SetPaymentAlerts(response.data.data);
      } catch (error) {
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
    };
      fetchPaymentAlerts();
    }, []);

    const { colorMode } = useColorMode();

    const handleSubmit = e => {
        e.preventDefault();
        let body = {
          company,
          message,
          date
        };
        SetSubmitLabel("Sending...");
        api()
        .post(`/admin/addpaymentalert`, {
          ...body
        })
        .then((res) => {
          SetPaymentAlerts([...paymentAlerts, res.data]);
          toast({
            title: "Payment Alert created.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          SetSubmitLabel("Send");
          SetCompany("");
          SetMessage("");
          SetDate("");
        })
        .catch((err) => {
          toast({
            title: "Error creating payment alert.",
            description: err.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          SetSubmitLabel("Send");
        });
    }

    const handleDelete = async (id) => {
      try {
        const response = await api().delete("/admin/deletepaymentalert/"+id);
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

                    <form className="payment-card-header-form" onSubmit={handleSubmit}>
                        <div className="payment-card-form-content">
                            <label htmlFor="company">Company:</label>
                            <input type="text"  name="company" value={company} onChange={e => SetCompany(e.target.value)} />
                        </div>

                        <div className="payment-card-form-content">
                            <label htmlFor="message">Message:</label>
                            <textarea name="message" value={message} onChange={e => SetMessage(e.target.value)} cols={30}/>
                        </div>

                        <div className="payment-card-form-content">
                            <label htmlFor="date">Date:</label>
                            <input name="date"  type="date" value={date} onChange={e => SetDate(e.target.value)} />
                        </div>

                        <button type="submit" className="cc-form-submit">{submitLabel}</button>

                    </form>


                </div>

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
                                          <Th>Company Name</Th>
                                          <Th>Message</Th>
                                          <Th>Action</Th>
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
                                                      <Td>
                                                          {item.company}
                                                      </Td>
                                                      <Td>{item.message}</Td>
                                                      <Td>
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

            </Card>

        </Flex>
    )
};

export default PaymentAlertCard;