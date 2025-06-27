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
  FormControl,
  FormLabel,
  Input,
  HStack,
  Select,
  Text,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { CgSearch } from "react-icons/cg";

// Custom components
import Card from "components/Card/Card.js";
import CustomCardHeader from "components/CustomCardHeader/CustomCardHeader.js";
import CardBody from "components/Card/CardBody.js";
import { Loading } from "components/Loading/Loading.js";

const SaleReports = () => {
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [saleReports, setSaleReports] = useState([]);
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [paidAmount, setPaidAmount] = useState(0);
  const [sumAmount, setSumAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLotteryCategories = async () => {
      try {
        const response = await api().get("/admin/getlotterycategory");
        if (response.data && response.data.success) {
          setLotteryCategories(response.data.data);
        }
      } catch (error) {
        console.error(
          "Error fetching lottery categories:",
          error.response ? error.response.data : error
        );
        toast({
          title: "Error fetching lottery categories",
          description: error.response
            ? error.response.data.message
            : "Network error. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchSeller = async () => {
      try {
        const response = await api().get("/superVisor/getseller");
        if (response.data && response.data.users) {
          setSellerInfo(response.data.users);
        }
      } catch (error) {
        toast({
          title: "Error fetching seller info",
          description: error.response
            ? error.response.data.message
            : "Network error. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchLotteryCategories();
    fetchSeller();
  }, []);

  const fetchReports = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api().get(
        `/superVisor/getSalereports?seller=${selectedSellerId}&fromDate=${fromDate}&toDate=${toDate}&lotteryCategoryName=${lotteryCategoryName.trim()}`
      );
      console.log(response);
      const responseData = response.data.data || {};
      const saleReportsArray = Object.values(responseData);

      const saleReportsWithCompany = saleReportsArray.map((sellerData) => {
        const seller = sellerInfo.find(
          (info) => info.userName === sellerData.name
        );
        return {
          ...sellerData,
          companyName: seller ? seller.companyName : "N/A",
        };
      });
      setSaleReports(saleReportsWithCompany);

      setSumAmount(
        saleReportsWithCompany.reduce(
          (acc, sellerData) => acc + (sellerData.sum || 0),
          0
        )
      );
      setPaidAmount(
        saleReportsWithCompany.reduce(
          (acc, sellerData) => acc + (sellerData.paid || 0),
          0
        )
      );
    } catch (error) {
      console.error("Error fetching sale reports:", error);
      toast({
        title: "Error fetching sale reports",
        description: error.response
          ? error.response.data.message
          : "Network error. Please try again.",
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
          showAllInSellerField={true}
          showAllInLotteryField={true}
        />
        <div className="custom-card-body">
        <CardBody>
          <Table variant="striped" color="black">
            <Thead>
              <Tr>
                <Th>Seller Name</Th>
                <Th>Company</Th>
                <Th>Total</Th>
                <Th>Paid</Th>
                <Th>Profit</Th>
              </Tr>
            </Thead>

            {loading ? (
              <Tbody>
                <Tr>
                  <Td colSpan={5}>
                    <Loading />
                  </Td>
                </Tr>
              </Tbody>
            ) : (
              <>
                <Tbody>
                  {Object.values(saleReports).map((sellerData) => (
                    <Tr key={sellerData.name}>
                      <Td>{sellerData.name}</Td>
                      <Td>{sellerData.companyName}</Td>
                      <Td>{sellerData.sum || 0}</Td>
                      <Td>{sellerData.paid || 0}</Td>
                      <Td>{(sellerData.sum || 0) - (sellerData.paid || 0)}</Td>
                    </Tr>
                  ))}
                </Tbody>

                <Thead>
                  <Tr>
                    <Th>Total ({saleReports.length})</Th>
                    <Th></Th>
                    <Th>{sumAmount}</Th>
                    <Th>{paidAmount}</Th>
                    <Th>{sumAmount - paidAmount}</Th>
                  </Tr>
                </Thead>
              </>
            )}
          </Table>
        </CardBody>
        </div>
      </Card>
    </Flex>
  );
};

export default SaleReports;
