import { useState, useEffect, Fragment } from "react";
import api from "../../utils/customFetch.js";

import {
  Flex,
  Button,
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
import { FaPlus } from "react-icons/fa";

import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";


// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";
import CustomCardHeader from "components/CustomCardHeader/CustomCardHeader.js";

const initWinNumbers = [
  {
    gameCategory: "BLT",
    position: 1,
    number: "",
  },
  {
    gameCategory: "BLT",
    position: 2,
    number: "",
  },
  {
    gameCategory: "BLT",
    position: 3,
    number: "",
  },
  {
    gameCategory: "L3C",
    position: 1,
    number: "",
  },
  {
    gameCategory: "L4C 1",
    position: 1,
    number: "",
  },
  {
    gameCategory: "L4C 2",
    position: 1,
    number: "",
  },
  {
    gameCategory: "L4C 3",
    position: 1,
    number: "",
  },
  {
    gameCategory: "L5C 1",
    position: 1,
    number: "",
  },
  {
    gameCategory: "L5C 2",
    position: 1,
    number: "",
  },
  {
    gameCategory: "L5C 3",
    position: 1,
    number: "",
  },
  {
    gameCategory: "MRG",
    position: 1,
    number: "",
  },
  {
    gameCategory: "MRG",
    position: 2,
    number: "",
  },
  {
    gameCategory: "MRG",
    position: 3,
    number: "",
  },
  {
    gameCategory: "MRG",
    position: 4,
    number: "",
  },
  {
    gameCategory: "MRG",
    position: 5,
    number: "",
  },
  {
    gameCategory: "MRG",
    position: 6,
    number: "",
  },
];

const WinningNumbersManagement = () => {
  const [editing, setEditing] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [numbers, setNumbers] = useState(initWinNumbers);
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [winningNumbers, setWinningNumbers] = useState([]);
  const [currentWinNumber, setCurrentWinNumber] = useState();
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [toDate, setToDate] = useState(new Date().toLocaleDateString("en-CA"));

  useEffect(() => {
    setNumbers(initWinNumbers);
  }, [lotteryCategoryName]);

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
  }, []);

  const fetchWinningNumbers = async (e) => {
    e.preventDefault();
    try {
      const response = await api().post("/admin/getwiningnumber", {
        lotteryCategoryName: "",
        fromDate,
        toDate,
      });
      console.log("the response is ",response);
      setWinningNumbers(response.data.data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching winning numbers",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleNumberChange = (index1, value) => {

    console.log("the value is " + value,"the index is " + index1);
    const newNumbers = [...numbers];
    newNumbers[index1].number = value;
    // L4C
    newNumbers[4].number = `${numbers[1].number}${numbers[2].number}`;
    newNumbers[5].number = `${numbers[0].number}${numbers[1].number}`;
    newNumbers[6].number = `${numbers[0].number}${numbers[2].number}`;

    // L5C
    newNumbers[7].number = `${numbers[3].number}${numbers[2].number}`;
    newNumbers[8].number = `${numbers[3].number}${numbers[1].number}`;
    newNumbers[9].number = `${numbers[3].number}${numbers[0].number}`;

    // MRG
    newNumbers[10].number = `${numbers[0].number}×${numbers[1].number}`;
    newNumbers[11].number = `${numbers[0].number}×${numbers[2].number}`;
    newNumbers[12].number = `${numbers[1].number}×${numbers[2].number}`;
    newNumbers[13].number = `${numbers[1].number}×${numbers[0].number}`;
    newNumbers[14].number = `${numbers[2].number}×${numbers[0].number}`;
    newNumbers[15].number = `${numbers[2].number}×${numbers[1].number}`;

    setNumbers([...newNumbers]);
  };

  const handleCancel = () => {
    setEditing(false);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editing) {
      handleUpdate(currentWinNumber._id);
    } else {
      try {
        const response = await api().post("/admin/addwiningnumber", {
          lotteryCategoryName: lotteryCategoryName.trim(),
          date,
          numbers: numbers,
        });
        setLotteryCategoryName("");
        setDate(new Date().toLocaleDateString("en-CA"));
        setNumbers(initWinNumbers);
        setEditing(false);
        onClose();
        
        if ( new Date(response.data.date) >= new Date(fromDate) && new Date(response.data.date) <= new Date(toDate) ) {
          try {
            setWinningNumbers([...winningNumbers, response.data]);
          } catch (err) {
            setWinningNumbers([response.data]);
          }
        } 
        toast({
          title: "Winning number created",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error creating winning number",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api().patch(`/admin/updatewiningnumber/${id}`, {
        lotteryCategoryName,
        date,
        numbers: numbers,
      });
      setLotteryCategoryName("");
      setDate(new Date().toLocaleDateString("en-CA"));
      setNumbers(initWinNumbers);
      setEditing(false);
      onClose();
      const index = winningNumbers.findIndex((number) => number._id === id);
      const newWinningNumbers = [...winningNumbers];
      newWinningNumbers[index] = {
        _id: id,
        lotteryCategoryName,
        date,
        numbers: numbers,
      };
      setWinningNumbers([...newWinningNumbers]);
      toast({
        title: "Winning number updated",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error updating winning number",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (number) => {
    setEditing(true);
    setLotteryCategoryName(number?.lotteryCategoryName);
    setDate(number?.date.substr(0, 10));
    setNumbers(number?.numbers);
    setCurrentWinNumber(number);
    onOpen();
  };

  const handleDelete = async (id) => {
    try {
      await api().delete(`/admin/deletewiningnumber/${id}`);
      setWinningNumbers(winningNumbers.filter((number) => number._id !== id));
      toast({
        title: "Winning number deleted",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error deleting winning number",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      const parts = dateString?.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${month}/${day}/${year}`;
      }
    } catch (err) {}
    // Return the original string if it doesn't match the expected format
    return dateString;
  };

  const handleAddWinNumbers = () => {
    setLotteryCategoryName(lotteryCategories[0]?.lotteryName);
    onOpen();
  }

  return (
 <Flex direction="column" justifyContent="center" alignItems="center" width="60%" mx="auto" pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} p={{ base: "5px", md: "20px"}} width="100%" border={{base: "none", md: "1px solid gray"}}>
        
        <CustomCardHeader 
            title = "Winning Numbers"
            showSellerField={false}
            showLotteryField={false}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            handleSearch={fetchWinningNumbers}
            showHeaderAction={true}
            handleHeaderAction={handleAddWinNumbers}
        />
        
        <div className="custom-card-body">
        <CardBody>
          <Flex
            flexWrap="wrap"
            flexDirection={{ base: "column", sm: "row" }}
            justifyContent="flex-start"
            width="100%"
          >
            {winningNumbers?.map((number, index) => (
              <Stack
                key={index}
                spacing={1}
                width="350px"
                borderRadius="3px"
                p="5px"
                m="10px"
                border={"1px solid gray"}
                boxShadow="0px 0px 2px white"
              >
                <VStack spacing={3} align="stretch" color="black">
                  <FormControl id="lotteryCategoryName" isRequired>
                    <HStack justifyContent="space-between">
                      <Box>
                        <FormLabel>Lottery Category Name</FormLabel>
                        <FormLabel >
                          {number?.lotteryCategoryName}
                        </FormLabel>
                      </Box>
                      <Box>
                        <FormLabel>Date</FormLabel>
                        <FormLabel >
                          {formatDate(number?.date.substr(0, 10))}
                        </FormLabel>
                      </Box>
                    </HStack>
                  </FormControl>
                  <Flex justifyContent={"right"}>
                    <Box>
                      <Button
                        size="sm"
                        mr={2}
                        onClick={() => handleEdit(number)}
                        bg={colorMode === "light" ? "yellow.500" : "yellow.300"}
                        _hover={{
                          bg:
                            colorMode === "light" ? "yellow.600" : "yellow.200",
                        }}
                      >
                        <FaEdit size={20} color="white"/>
                      </Button>
                      {/* <Button
                        size="sm"
                        onClick={() => handleDelete(number?._id)}
                        bg={colorMode === "light" ? "red.500" : "red.300"}
                        _hover={{
                          bg: colorMode === "light" ? "red.600" : "red.200",
                        }}
                      >
                        <RiDeleteBinLine size={20} color="white"/>
                      </Button> */}
                    </Box>
                  </Flex>
                  <FormControl id="winNumbers" isRequired>
                    <FormLabel>Win Numbers</FormLabel>
                    <Stack p="5px">
                      <Flex
                        justifyContent="space-between"
                      >
                        <VStack
                          flexBasis={{ base: "100%", md: "30%" }}
                          color="black"
                          mx="3px"
                        >
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              1st (First)
                            </FormLabel>
                            <Input
                              placeholder="First"
                              maxLength={2}
                              isReadOnly={true}
                              value={number?.numbers[0]?.number}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              2nd (Second)
                            </FormLabel>
                            <Input
                              placeholder="Second"
                              maxLength={2}
                              isReadOnly={true}
                              value={number?.numbers[1]?.number}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              3rd (Third)
                            </FormLabel>
                            <Input
                              placeholder="Third"
                              maxLength={2}
                              isReadOnly={true}
                              value={number?.numbers[2]?.number}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L3C
                            </FormLabel>
                            <Input
                              placeholder="L3C"
                              maxLength={3}
                              isReadOnly={true}
                              value={number?.numbers[3]?.number}
                            />
                          </Box>
                        </VStack>

                        <VStack
                          flexBasis={{ base: "100%", md: "30%" }}
                          color="black"
                          mx="3px"
                        >
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              MRG1
                            </FormLabel>
                            <Input
                              placeholder="MRG1"
                              isReadOnly={true}
                              value={number?.numbers[10]?.number}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              MRG2
                            </FormLabel>
                            <Input
                              placeholder="MRG2"
                              isReadOnly={true}
                              value={number?.numbers[11]?.number}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              MRG3
                            </FormLabel>
                            <Input
                              placeholder="MRG3"
                              isReadOnly={true}
                              value={number?.numbers[12]?.number}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              MRG4
                            </FormLabel>
                            <Input
                              placeholder="MRG4"
                              isReadOnly={true}
                              value={number?.numbers[13]?.number}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              MRG5
                            </FormLabel>
                            <Input
                              placeholder="MRG5"
                              isReadOnly={true}
                              value={number?.numbers[14]?.number}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              MRG6
                            </FormLabel>
                            <Input
                              placeholder="MRG5"
                              isReadOnly={true}
                              value={number?.numbers[15]?.number}
                            />
                          </Box>
                        </VStack>

                        <VStack
                          flexBasis={{ base: "100%", md: "30%" }}
                          color="black"
                          mx="3px"
                        >
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L4C1
                            </FormLabel>
                            <Input
                              placeholder="L4C1"
                              isReadOnly={true}
                              value={number?.numbers[4]?.number}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L4C2
                            </FormLabel>
                            <Input
                              placeholder="L4C2"
                              isReadOnly={true}
                              value={number?.numbers[5]?.number}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L4C3
                            </FormLabel>
                            <Input
                              placeholder="L4C3"
                              isReadOnly={true}
                              value={number?.numbers[6]?.number}
                            />
                          </Box>

                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L5C1
                            </FormLabel>
                            <Input
                              placeholder="L5C1"
                              isReadOnly={true}
                              value={number?.numbers[7]?.number}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L5C2
                            </FormLabel>
                            <Input
                              placeholder="L5C2"
                              isReadOnly={true}
                              value={number?.numbers[8]?.number}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L5C3
                            </FormLabel>
                            <Input
                              placeholder="L5C3"
                              isReadOnly={true}
                              value={number?.numbers[9].number}
                            />
                          </Box>
                        </VStack>
                      </Flex>
                    </Stack>
                  </FormControl>
                </VStack>
              </Stack>
            ))}
          </Flex>
        </CardBody>
        </div>
      </Card>
      {/* Create/Edit User Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={editing ? "Edit Number" : "Create Number"}
        submitButtonText={editing ? "Update" : "Create"}
        onSubmit={handleSubmit}
        cancelButtonText="Cancel"
        onCancel={handleCancel}
        colorMode={colorMode}
        size="md"
      >
        <Stack spacing={4}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl id="date" isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={date}
                  background="none"
                  width="100%"
                  onChange={(event) => setDate(event.target.value)}
                />
              </FormControl>
              <FormControl id="lotteryCategoryName" isRequired>
                <FormLabel>Lottery Category Name</FormLabel>
                <Select
                  onChange={(event) =>
                    setLotteryCategoryName(event.target.value)
                  }
                  defaultValue={lotteryCategories[0]?.lotteryName}
                >
                  {lotteryCategories.map((category) => (
                    <option key={category._id} value={category.lotteryName}>
                      {category.lotteryName}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="winNumbers" isRequired>
                <FormLabel>Win Numbers</FormLabel>
                <Stack bg={"white"} p="5px">
                  <Flex
                    flexWrap="wrap"
                    flexDirection={{ base: "column", md: "row" }}
                    justifyContent="space-between"
                  >
                    <VStack
                      flexBasis={{ base: "100%", md: "32%" }}
                      color="black"
                    >
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          1st (First)
                        </FormLabel>
                        <Input
                          placeholder="First"
                          maxLength={2}
                          value={numbers[0].number}
                          background="none"
                          onChange={(event) =>
                            handleNumberChange(0, event.target.value)
                          }
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          2nd (Second)
                        </FormLabel>
                        <Input
                          placeholder="Second"
                          maxLength={2}
                          background="none"
                          value={numbers[1].number}
                          onChange={(event) =>
                            handleNumberChange(1, event.target.value)
                          }
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          3rd (Third)
                        </FormLabel>
                        <Input
                          placeholder="Third"
                          maxLength={2}
                          background="none"
                          value={numbers[2].number}
                          onChange={(event) =>
                            handleNumberChange(2, event.target.value)
                          }
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L3C
                        </FormLabel>
                        <Input
                          placeholder="L3C"
                          maxLength={3}
                          background="none"
                          value={numbers[3].number}
                          onChange={(event) =>
                            handleNumberChange(3, event.target.value)
                          }
                        />
                      </Box>
                    </VStack>

                    <VStack
                      flexBasis={{ base: "100%", md: "32%" }}
                      color="black"
                    >
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          MRG1
                        </FormLabel>
                        <Input
                          placeholder="MRG1"
                          background="none"
                          /*isReadOnly={true}*/
                          value={numbers[10].number}
                          onChange={(event) =>
                            handleNumberChange(10, event.target.value)
                          }
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          MRG2
                        </FormLabel>
                        <Input
                          placeholder="MRG2"
                          background="none"
                          /*isReadOnly={true}*/
                          value={numbers[11].number}
                          onChange={(event) =>
                            handleNumberChange(11, event.target.value)
                          }
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          MRG3
                        </FormLabel>
                        <Input
                          placeholder="MRG3"
                          background="none"
                          // isReadOnly={false}
                          value={numbers[12].number}
                          onChange={(event) =>
                            handleNumberChange(12, event.target.value)
                          }
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          MRG4
                        </FormLabel>
                        <Input
                          placeholder="MRG4"
                          background="none"
                          /*isReadOnly={true}*/
                          value={numbers[13].number}
                          onChange={(event) =>
                            handleNumberChange(13, event.target.value)
                          }
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          MRG5
                        </FormLabel>
                        <Input
                          placeholder="MRG5"
                          background="none"
                          /*isReadOnly={true}*/
                          value={numbers[14].number}
                          onChange={(event) =>
                            handleNumberChange(14, event.target.value)
                          }
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          MRG6
                        </FormLabel>
                        <Input
                          placeholder="MRG5"
                          background="none"
                          /*isReadOnly={true}*/
                          value={numbers[15].number}
                          onChange={(event) =>
                            handleNumberChange(15, event.target.value)
                          }
                        />
                      </Box>
                    </VStack>

                    <VStack
                      flexBasis={{ base: "100%", md: "32%" }}
                      color="black"
                    >
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L4C1
                        </FormLabel>
                        <Input
                          placeholder="L4C1"
                          background="none"
                          // isReadOnly={true}
                          value={numbers[4].number}
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L4C2
                        </FormLabel>
                        <Input
                          placeholder="L4C2"
                          background="none"
                          // isReadOnly={true}
                          value={numbers[5].number}
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L4C3
                        </FormLabel>
                        <Input
                          placeholder="L4C3"
                          background="none"
                          // isReadOnly={true}
                          value={numbers[6].number}
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L5C1
                        </FormLabel>
                        <Input
                          placeholder="L5C1"
                          background="none"
                          // isReadOnly={true}
                          value={numbers[7].number}
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L5C2
                        </FormLabel>
                        <Input
                          placeholder="L5C2"
                          background="none"
                          // isReadOnly={true}
                          value={numbers[8].number}
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L5C3
                        </FormLabel>
                        <Input
                          placeholder="L5C3"
                          background="none"
                          // isReadOnly={true}
                          value={numbers[9].number}
                        />
                      </Box>
                    </VStack>
                  </Flex>
                </Stack>
              </FormControl>
            </VStack>
          </form>
        </Stack>
      </Modal>
    </Flex>
  );
};

export default WinningNumbersManagement;
