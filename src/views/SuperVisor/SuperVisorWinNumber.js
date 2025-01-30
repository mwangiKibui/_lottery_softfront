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

import { Loading } from "components/Loading/Loading.js";

// Custom components
import Card from "components/Card/Card.js";
import CustomCardHeader from "components/CustomCardHeader/CustomCardHeader.js";
import CardBody from "components/Card/CardBody.js";

const WinNumber = () => {
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [winningNumbers, setWinningNumbers] = useState([]);
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [toDate, setToDate] = useState(new Date().toLocaleDateString("en-CA"));

  const [loading, setLoading] = useState(false);

  const fetchWinningNumbers = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api().post("superVisor/getwiningnumber", {
        lotteryCategoryName: "",
        fromDate,
        toDate,
      });
      setWinningNumbers(response.data.data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching winning numbers",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${month}/${day}/${year}`;
    }
    // Return the original string if it doesn't match the expected format
    return dateString;
  };

  return (
    <Flex direction="column" justifyContent="center" alignItems="center" width="60%" mx="auto" pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} p={{ base: "5px", md: "20px"}} width="100%" border={{base: "none", md: "1px solid gray"}}>
        <CustomCardHeader
          title="Winning Number"
          showSellerField={false}
          showLotteryField={false}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          handleSearch={fetchWinningNumbers}
          colorMode={colorMode}
        />
        <div className="custom-card-body">
          <CardBody>
            <Flex
               flexWrap="wrap"
               flexDirection={{ base: "column", sm: "row" }}
               justifyContent="flex-start"
               width="100%"
            >
              <Table variant="striped" color="black">
                <Thead>
                  <Tr>
                    <Th color="black">Date</Th>
                    <Th color="black">Lottery</Th>
                    <Th color="black">L3C</Th>
                    <Th color="black">Second</Th>
                    <Th color="black">Third</Th>
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
                  <Tbody>
                    {winningNumbers?.map((game, gameIndex) => (
                      <Tr key={gameIndex}>
                        <Td>
                          <pre>{formatDate(game?.date.substr(0, 10))}</pre>
                        </Td>
                        <Td>
                          <pre>{game.lotteryName}</pre>
                        </Td>
                        <Td>
                          <pre>{game.numbers.l3c}</pre>
                        </Td>
                        <Td>
                          <pre>{game.numbers.second}</pre>
                        </Td>
                        <Td>
                          <pre>{game.numbers.third}</pre>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                )}
              </Table>
            </Flex>
          </CardBody>
        </div>
      </Card>
    </Flex>
  );
};

export default WinNumber;
