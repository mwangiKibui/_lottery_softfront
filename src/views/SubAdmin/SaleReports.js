import { useState, useEffect, Fragment } from "react";
import api from "../../utils/customFetch.js";

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
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import { Loading } from "components/Loading/Loading.js";
import CustomCardHeader from "components/CustomCardHeader/CustomCardHeader.js";

const SaleReports = () => {
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [saleReports, setSaleReports] = useState([]);
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [toDate, setToDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [paidAmount, setPaidAmount] = useState(0);
  const [sumAmount, setSumAmount] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLotteryCategories = async () => {
      try {
        const response = await api().get("/admin/getlotterycategory");
        setLotteryCategories(response.data.data);
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

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api().get(
        `/subadmin/getsalereports?seller=${selectedSellerId}&fromDate=${fromDate}&toDate=${toDate}&lotteryCategoryName=${lotteryCategoryName.trim()}`
      );
      console.log(response.data.data);
      const responseData = response.data.data;
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
      setSaleReports(responseData);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching winner tickets",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex  justifyContent="center" alignItems="center" width="60%" mx="auto" direction="column" pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} p={{ base: "5px", md: "20px"}} width="100%" border={{base: "none", md: "1px solid gray"}}>

        <CustomCardHeader
          title="Sales Reports"
          setSelectedSellerId={setSelectedSellerId}
          sellerInfo={sellerInfo}
          setLotteryCategoryName={setLotteryCategoryName}
          lotteryCategories={lotteryCategories}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          handleSearch={fetchReports}
          colorMode={colorMode}
        />
        
        <div className="custom-card-body">
        <CardBody>
          <Table variant="striped" color="black">
            <Thead>
              <Tr>
                <Th>Seller Name</Th>
                <Th>Total</Th>
                <Th>Paid</Th>
                <Th>Profit</Th>
              </Tr>
            </Thead>
            {
              loading ?
              <Tbody>
                <Tr>
                  <Td colSpan={4}>
                    <Loading />
                  </Td>
                </Tr>
              </Tbody> :
              <>
                <Tbody>
                  {Object.values(saleReports).map((sellerData) => (
                    <Tr key={sellerData.name}>
                      <Td><pre>
                        {sellerData.name}
                      </pre></Td>
                      <Td><pre>
                        {sellerData.sum}
                      </pre></Td>
                      <Td><pre>
                        {sellerData.paid}
                      </pre></Td>
                      <Td><pre>
                        {sellerData.sum - sellerData.paid}
                      </pre></Td>
                    </Tr>
                  ))}
                </Tbody>
                <Thead>
                  <Tr>
                    <Th>Total ({Object.values(saleReports).length})</Th>
                    <Th>{sumAmount}</Th>
                    <Th> {paidAmount}</Th>
                    <Th>{sumAmount - paidAmount}</Th>
                  </Tr>
                </Thead>
              </>
            }
          </Table>
        </CardBody>
        </div>
      </Card>
    </Flex>
  );
};

export default SaleReports;
