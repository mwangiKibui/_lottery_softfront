
import { Flex,Stack,VStack,Table,Thead,Tbody,Tr,Th,Td,Button,useColorMode } from '@chakra-ui/react';
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import {useState} from 'react';
import './PaymentAlertCard.css';
import { RiDeleteBinLine } from "react-icons/ri";

const PaymentAlertCard = () => {

    const [company,SetCompany] = useState("");
    const [message,SetMessage] = useState("");
    const [date,SetDate] = useState("");
    const paymentAlerts = [
        {id:1,companyName:"Company A",Message:"You are supposed to pay before 26th June"},
        {id:2,companyName:"Company B",Message:"You are supposed to pay before 26th June"},
        {id:3,companyName:"Company C",Message:"You are supposed to pay before 26th June"},
        {id:4,companyName:"Company D",Message:"You are supposed to pay before 26th June"},
    ];
    const { colorMode } = useColorMode();

    const handleSubmit = e => {
        e.preventDefault();
        console.log("submission process");
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

                        <button type="submit" className="cc-form-submit">Send</button>

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
                                     
                                        <Tbody>
                                          {paymentAlerts.map((item) => {
                                            return (
                                              <Tr key={item.id}>
                                                <Td>
                                                    {item.companyName}
                                                </Td>
                                                <Td>{item.Message}</Td>
                                                <Td>
                                                  <Button
                                                    className="tableInterBtn"
                                                    size="sm"
                                                    onClick={() => console.log("ooh yeah we are deleting " + item.id)}
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