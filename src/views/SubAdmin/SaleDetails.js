import { useState, useEffect, Fragment } from "react";
import api from "../../utils/customFetch.js";
import { Loading } from "components/Loading/Loading.js";

import {
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useDisclosure,
  useToast,
  useColorMode,
  VStack,
  HStack,
  Select,
  Text,
  Box,
} from "@chakra-ui/react";
import { CgSearch } from "react-icons/cg";

// Custom components
import Card from "components/Card/Card.js";
import CustomCardHeader from "components/CustomCardHeader/CustomCardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

let intervalId = null;

const SaleDetails = () => {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [saleDatails, setSaleDetails] = useState([]);
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [gameCategoryDetail, setGameCategoryDetail] = useState([]);
  const [lotteryDetail, setLotteryDetail] = useState([]);
  const [gameNumberDetail, setGameNumberDetail] = useState([]);

  const [paidAmount, setPaidAmount] = useState(0);
  const [sumAmount, setSumAmount] = useState(0);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedNumber, setSelectedNumber] = useState("");
  const [selectedLottery, setSelectedLottery] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [limit, setLimit] = useState("");
  const [tickets, setTickets] = useState(0);
  const [gameNumberSellAmountSum, setGameNumberSellAmountSum] = useState(0);

  const [loading, setLoading] = useState(false);

  const fetchSellDetails = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const responseAllNumber = await api().get(
        `/sbuadmin/getselldetails?seller=${selectedSellerId}&lotteryCategoryName=${lotteryCategoryName.trim()}&fromDate=${fromDate}`
      );
      setSaleDetails(responseAllNumber.data.data);

      const responseByGameCatetory = await api().get(
        `/sbuadmin/getselldetailsbygamecategory?seller=${selectedSellerId}&lotteryCategoryName=${lotteryCategoryName.trim()}&fromDate=${fromDate}`
      );
      setGameCategoryDetail(responseByGameCatetory.data.data);

      const responseAllLottery = await api().get(
        `/sbuadmin/getselldetailsallloterycategory?seller=${selectedSellerId}&fromDate=${fromDate}`
      );
      const responseData = responseAllLottery.data.data;
      setSumAmount(
        Object.values(responseData).reduce(
          (acc, sellerData) => acc + sellerData.sum,
          0
        )
      );
      setPaidAmount(
        Object.values(responseData).reduce(
          (acc, sellerData) => acc + sellerData.paid,
          0
        )
      );
      setLotteryDetail(responseData);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Sell Details!",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }

  };

  const fetchSellGameNumberDetails = async (
    lottoName,
    gameName,
    number,
    date,
    seller
  ) => {
    try {
      const response = await api().get(
        `/sbuadmin/getsellgamenumberinfo?seller=${seller}&lotteryCategoryName=${lottoName}&fromDate=${date}&gameCategory=${gameName}&gameNumber=${number}`
      );
      const res = response.data;
      setGameNumberDetail(res.data);
      setLimit(res.limitInfo);
      setSelectedDate(new Date(date).toLocaleDateString("en-GB"));
      setSelectedNumber(number);
      setSelectedLottery(lottoName);
      setSelectedGame(gameName);
      setTickets(
        Object.values(res.data).reduce(
          (acc, sellerData) => acc + sellerData.ticketCount,
          0
        )
      );
      setGameNumberSellAmountSum(
        Object.values(res.data).reduce(
          (acc, sellerData) => acc + sellerData.sum,
          0
        )
      );
      onOpen();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  useEffect(() => {
    const fetchLotteryCategories = async () => {
      try {
        const response = await api().get("/admin/getlotterycategory");
        setLotteryCategories(response.data.data);
        setLotteryCategoryName(response.data.data[0].lotteryName);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching lottery categories",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchLotteryCategories();

    const fetchSeller = async () => {
      try {
        const response = await api().get("/subadmin/getseller");
        setSellerInfo(response.data.users);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching seller info",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchSeller();
  }, []);

  return (
    <Flex direction="column" justifyContent="center" alignItems="center" width="60%" mx="auto" pt={{ base: "120px", md: "75px" }}>
      <Card
        overflowX={{ sm: "scroll", xl: "hidden" }}
        p={{ base: "5px", md: "20px" }}
        width="100%"
        border={{ base: "none", md: "1px solid gray" }}
      >

        <CustomCardHeader
          title="Sale Details"
          setSelectedSellerId={setSelectedSellerId}
          sellerInfo={sellerInfo}
          setLotteryCategoryName={setLotteryCategoryName}
          lotteryCategories={lotteryCategories}
          fromDate={fromDate}
          setFromDate={setFromDate}
          handleSearch={fetchSellDetails}
          colorMode={colorMode}
          showToDate={false}
          showAllInSellerField={true}
        />
         <div className="custom-card-body">
            <CardBody className="sale-details-container">
              {
                loading ?
                <Loading /> :
                <HStack alignItems={"flex-start"} className="sale-details-stack">
                  <VStack width="50%">
                    <Table variant="striped">
                      <Thead>
                        <Tr>
                          <Th color="black">Game</Th>
                          <Th color="black">Number</Th>
                          <Th color="black">Amount</Th>
                          <Th color="black">Price</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {saleDatails.map((item, index) => ( 
                          <Tr key={index}>
                            <Td><pre>{item._id.gameCategory}</pre></Td>
                            <Td>
                              <Button
                                className="tableInterBtn"
                                size="sm"
                                color="white"
                                backgroundColor={"green"}
                                borderRadius="5px"
                                padding="0px"
                                onClick={() =>
                                  fetchSellGameNumberDetails(
                                    item._id.lotteryCategoryName,
                                    item._id.gameCategory,
                                    item._id.number,
                                    item._id.date,
                                    selectedSellerId
                                  )
                                }
                              >
                                {item._id.number}
                              </Button>
                            </Td>
                            <Td><pre>{item.count}</pre></Td>
                            <Td><pre>{item.totalAmount}</pre></Td>
                          </Tr> 
                        ))}
                      </Tbody>
                      <Thead>
                        <Th></Th>
                        <Th>Total</Th>
                        <Th>HTG</Th>
                        <Th>
                          {saleDatails.reduce(
                            (total, value) => total + value.totalAmount,
                            0
                          )}
                        </Th>
                      </Thead>
                    </Table>
                  </VStack>
                  <VStack width="50%">
                    <VStack width="100%" border={"1px solid gray"} padding={"10px"}>
                      <h4 style={{marginBottom: "3px"}}>{gameCategoryDetail[0]?._id?.lotteryCategoryName}</h4>
                      {gameCategoryDetail?.map((item, index) => (
                        <Flex
                          width="70%"
                          justifyContent={"space-between"}
                          key={index}
                          mt="0px !important"
                        >
                          <h5 className="custom-h5">{item?._id?.gameCategory}</h5>
                          <h5 className="custom-h5">{item?.totalAmount}</h5>
                        </Flex>
                      ))}
                      <Flex width="70%" justifyContent={"space-between"} mt="0px !important">
                        <h5 className="custom-h5">Total</h5>
                        <h5 className="custom-h5">
                          {gameCategoryDetail?.reduce(
                            (acc, detail) => acc + detail.totalAmount,
                            0
                          )}
                        </h5>
                      </Flex>
                    </VStack>
                    <VStack marginTop="0px !important" width="100%">
                      <Table variant="striped">
                        <Thead>
                          <Tr>
                            <Th color="black">Lottery</Th>
                            <Th color="black">Total</Th>
                            <Th color="black">Paid</Th>
                            <Th color="black">Profit</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {Object.values(lotteryDetail).map((data) => (
                            <Tr key={data.name}>
                              <Td><pre>{data.name}</pre></Td>
                              <Td><pre>{data.sum}</pre></Td>
                              <Td><pre>{data.paid}</pre></Td>
                              <Td><pre>{data.sum - data.paid}</pre></Td>
                            </Tr>
                          ))}
                        </Tbody>
                        <Thead>
                          <Th>Total</Th>
                          <Th>{sumAmount}</Th>
                          <Th>{paidAmount}</Th>
                          <Th>{sumAmount - paidAmount}</Th>
                        </Thead>
                      </Table>
                    </VStack>
                  </VStack>
                </HStack>
              }
            </CardBody>
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={handleCancel} onCancel={handleCancel} colorMode={colorMode}>
        <Stack spacing={2} mt="30px">
          <Flex>
            <Table variant="striped" mr="5px">
              <Tbody>
                <Tr>
                  <Td><pre>{selectedGame}</pre></Td>
                  <Td><pre>{selectedNumber}</pre></Td>
                </Tr>
                <Tr>
                  <Td><pre>Date</pre></Td>
                  <Td><pre>{selectedDate}</pre></Td>
                </Tr>
                <Tr>
                  <Td><pre>Lottery</pre></Td>
                  <Td><pre>{selectedLottery}</pre></Td>
                </Tr>
              </Tbody>
            </Table>
            <Table variant="striped">
              <Tbody>
                <Tr>
                  <Td><pre>Limite</pre></Td>
                  <Td><pre>{limit}</pre></Td>
                </Tr>
                <Tr>
                  <Td><pre>Pari</pre></Td>
                  <Td><pre>{gameNumberSellAmountSum}</pre></Td>
                </Tr>
                <Tr>
                  <Td><pre>Disponible</pre></Td>
                  <Td><pre>{limit - gameNumberSellAmountSum}</pre></Td>
                </Tr>
              </Tbody>
            </Table>
          </Flex>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Seller</Th>
                <Th>Company</Th>
                <Th>Tickets</Th>
                <Th>Price</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.values(gameNumberDetail).map((item, index) => (
                <Tr key={index}>
                  <Td><pre>{item.name}</pre></Td>
                  <Td><pre>{item.company}</pre></Td>
                  <Td><pre>{item.ticketCount}</pre></Td>
                  <Td><pre>{item.sum}</pre></Td>
                </Tr>
              ))}
            </Tbody>
            <Thead>
              <Tr>
                <Th></Th>
                <Th>Total</Th>
                <Th>{tickets}</Th>
                <Th>{gameNumberSellAmountSum}</Th>
              </Tr>
            </Thead>
          </Table>
        </Stack>
      </Modal>
    </Flex>
  );
};

export default SaleDetails;
