import React, { useState, useEffect } from "react";
import api from "../../utils/customFetch.js";
import {
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  RadioGroup,
  Radio,
  Stack,
  useDisclosure,
  useToast,
  HStack,
  Select,
  VStack,
  ModalContent,
  ModalBody,
  ModalHeader,
  Box,
} from "@chakra-ui/react";
import { FaPlus, FaEdit, FaTimesCircle, FaWatchmanMonitoring, FaNotEqual, FaCircle } from "react-icons/fa";
import { CgSearch } from "react-icons/cg";
import { RiDeleteBinLine } from "react-icons/ri";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

const LimitNumber = () => {
  const [editing, setEditing] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(null);
  const [limitNumbers, setLimitNumbers] = useState([]);
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [sellers, setSellers] = useState([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [selectedSeller, setSelectedSeller] = useState("");
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [blt, setBlt] = useState("");
  const [l3c, setL3c] = useState("");
  const [mrg, setMrg] = useState("");
  const [l4c1, setL4c1] = useState("");
  const [l4c2, setL4c2] = useState("");
  const [l4c3, setL4c3] = useState("");
  const [l5c1, setL5c1] = useState("");
  const [l5c2, setL5c2] = useState("");
  const [l5c3, setL5c3] = useState("");
  const [activeView, setActiveView] = useState("all");
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lotteryName, setLotteryName] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [
          lotteryResponse,
          sellersResponse,
          supervisorsResponse
        ] = await Promise.all([
          api().get("/admin/getlotterycategory"),
          api().get("/subadmin/getseller"),
          // api().get("/subadmin/getsellerWhoNotHaveSupervisor"),
          api().get("/subadmin/getsuperVisor"),
          api().get("/subadmin/getLimitButAll")
        ]);

        if(activeView == "all"){
          const allLimitsResponse = await api().get("/subadmin/getLimitButAll");
          setLimitNumbers(allLimitsResponse?.data);
        }

        setLotteryCategories(lotteryResponse?.data?.data);
        setSupervisors(supervisorsResponse?.data);
        setSellers(sellersResponse?.data?.users);
      } catch (error) {
        toast({
          title: "Error fetching initial data",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchInitialData();
  }, [toast]);

  const handleGetLimit = async (viewType) => {
    setActiveView(viewType);
    setLotteryCategoryName("");
    if (viewType === "all") {
      setShowSearchForm(false);
      try {
        const response = await api().get("/subadmin/getLimitButAll");
        setLimitNumbers(response.data);
      } catch (error) {
        toast({
          title: "Error fetching limits",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      setShowSearchForm(true);
      setLimitNumbers([]);
    }
  };
  const handleCancel = () => {
    setEditing(false);
    setCurrentUser(null);
    resetForm();
    onClose();
  };
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      if (
        !activeView ||
        (activeView !== "supervisor" && activeView !== "seller" && activeView !== "all")
      ) {
        throw new Error("Invalid view type");
      }
      const endpoint = activeView == 'supervisor' || activeView == 'seller' ?  `/subadmin/getLimitBut${
        activeView === "supervisor" ? "SuperVisor" : "Seller"
      }` : `/subadmin/getLimitButAll`;
      const params = {
        seller: selectedSellerId,
        superVisor: selectedSupervisorId,
        lotteryCategoryName,
      };

      console.log("the params here ",params);
      const response = await api().get(endpoint, { params });
      console.log("the response received is ", response.data);
      setLimitNumbers(response.data);
      toast({
        title: "Limits fetched successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error fetching limits",
        description: error.message || "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLimitNumbers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const limits = [
      { gameCategory: "BLT", limitsButs: blt },
      { gameCategory: "L3C", limitsButs: l3c },
      { gameCategory: "MRG", limitsButs: mrg },
      { gameCategory: "L4C 1", limitsButs: l4c1 },
      { gameCategory: "L4C 2", limitsButs: l4c2 },
      { gameCategory: "L4C 3", limitsButs: l4c3 },
      { gameCategory: "L5C 1", limitsButs: l5c1 },
      { gameCategory: "L5C 2", limitsButs: l5c2 },
      { gameCategory: "L5C 3", limitsButs: l5c3 },
    ];
    const data = {
      lotteryCategoryName:
        lotteryCategoryName || lotteryCategories[0]?.lotteryName,
      limits,
      seller: activeView === "seller" ? selectedSeller : undefined,
      superVisor: activeView === "supervisor" ? selectedSupervisor : undefined,
    };

    try {
      const response = editing
        ? await api().patch(
            `/subadmin/updatelimitbut/${currentLimit?._id}`,
            data
          )
        : await api().post("/subadmin/addlimitbut", data);

        console.log("Response: ", response);
        
      setLimitNumbers((prev) =>
        editing
          ? prev.map((limit) =>
              limit._id === currentLimit?._id ? response.data : limit
            )
          : [...prev, response.data]
      );
      onClose();
      toast({
        title: `Limit ${editing ? "updated" : "created"} successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: `Error ${editing ? "updating" : "creating"} limit`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (limit) => {
    setEditing(true);
    setCurrentLimit(limit);
    setLotteryCategoryName(limit.lotteryCategoryName);
    setSelectedSeller(limit.seller?._id || "");
    setSelectedSupervisor(limit.superVisor?._id || "");
    setBlt(limit.limits[0]?.limitsButs || "");
    setL3c(limit.limits[1]?.limitsButs || "");
    setMrg(limit.limits[2]?.limitsButs || "");
    setL4c1(limit.limits[3]?.limitsButs || "");
    setL4c2(limit.limits[4]?.limitsButs || "");
    setL4c3(limit.limits[5]?.limitsButs || "");
    setL5c1(limit.limits[6]?.limitsButs || "");
    setL5c2(limit.limits[7]?.limitsButs || "");
    setL5c3(limit.limits[8]?.limitsButs || "");
    onOpen();
  };

  const handleDelete = async (id) => {
    try {
      await api().delete(`/subadmin/deletelimitbut/${id}`);
      setLimitNumbers((prev) => prev.filter((limit) => limit._id !== id));
      toast({
        title: "Limit deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting limit",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      direction="column"
      pt={{ base: "120px", md: "75px" }}
      mx="auto"
      justifyContent="center"
      alignItems="center" // Add this to center children horizontally
      width="100%"
    >
      <Card
        overflowX={{ sm: "scroll", xl: "hidden" }}
        p={{ base: "5px", md: "20px" }}
        width="60%"
        border={{ base: "none", md: "1px solid gray" }}
        borderRadius="none"
        bg="gray"
      >
        <CardHeader
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bg="#92CCDC"
        >
          <Text fontSize="lg" fontWeight="bold">
            Limit Numbers
          </Text>
          <Button
            onClick={() => {
              setEditing(false);
              onOpen();
            }}
            bg="green.800"
            color="white"
          >
            {/* <FaPlus /> */}
            ADD
          </Button>
        </CardHeader>

        <CardHeader
             display="flex"
             justifyContent="center"
             alignItems="center"
             bg="#92CCDC"
             mt="10px"
             py="15px"
          >
            <RadioGroup
                onChange={handleGetLimit}
                value={activeView}
                display="flex"
                gap={4}
            >
              <Radio
                value="all"
                colorScheme="blue"
                isDisabled={isLoading}
                size="lg"
              >
                All
              </Radio>
              <Radio
                value="supervisor"
                colorScheme="blue"
                isDisabled={isLoading}
                size="lg"
              >
                Supervisor
              </Radio>
              <Radio
                value="seller"
                colorScheme="blue"
                isDisabled={isLoading}
                size="lg"
              >
                Seller
              </Radio>
          </RadioGroup>

        </CardHeader>
        
        {
          activeView.toLowerCase() == "all"  && (
            <CardHeader
            display="flex"
            justifyContent="center"
            alignItems="center"
            bg="#92CCDC"
            py="10px"
          >
  
            <HStack>
            <FormControl flex={1} flexDirection="row">
              <FormLabel>Lottery: </FormLabel>
                <Select
                  value={lotteryCategoryName}
                  onChange={(e) => setLotteryCategoryName(e.target.value)}
                >
                  <option value="">All</option>
                  {lotteryCategories.map((category) => (
                    <option key={category._id} value={category.lotteryName}>
                      {category.lotteryName}
                    </option>
                  ))}
                </Select>
              
            </FormControl>
  
            <VStack>
                  <Button
                    onClick={handleSearch}
                    bg="#F3960C"
                    color="white"
                    isLoading={isLoading}
                  >
                    Search
                  </Button>
                </VStack>
            </HStack>
  
          </CardHeader>
          )
        }
       

        {showSearchForm && (
          <CardHeader
            display="flex"
            flexDirection={{ base: "column", md: "row" }}
            gap={5}
            bg="#92CCDC"
            marginTop="5px"
            paddingBottom="10px"
            justifyContent="center"
          >
            <HStack>
              <FormControl flex={1}>
                <FormLabel>
                  {activeView === "seller" ? "Seller" : "Supervisor"}
                </FormLabel>
                <Select
                  value={
                    activeView === "seller"
                      ? selectedSellerId
                      : selectedSupervisorId
                  }
                  onChange={(e) =>
                    activeView === "seller"
                      ? setSelectedSellerId(e.target.value)
                      : setSelectedSupervisorId(e.target.value)
                  }
                  width="200px"
                >
                  <option value="">
                    {activeView === "seller"
                      ? "Select seller"
                      : "Select Supervisor"}
                  </option>
                  {(activeView === "seller" ? sellers : supervisors).map(
                    (person) => (
                      <option key={person._id} value={person._id}>
                        {person.userName}
                      </option>
                    )
                  )}
                </Select>
              </FormControl>
              <FormControl flex={1}>
                <FormLabel>Category Name</FormLabel>
                <Select
                  value={lotteryCategoryName}
                  onChange={(e) => setLotteryCategoryName(e.target.value)}
                >
                  <option value="">All</option>
                  {lotteryCategories.map((category) => (
                    <option key={category._id} value={category.lotteryName}>
                      {category.lotteryName}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <VStack>
                <Text marginBottom="20px"></Text>
                <Button
                  onClick={handleSearch}
                  bg="blue.600"
                  color="white"
                  isLoading={isLoading}
                >
                  <CgSearch />
                </Button>
              </VStack>
            </HStack>
          </CardHeader>
        )}

        <CardBody>
          <Flex wrap="wrap" justifyContent="space-between" gap={3}>
            {limitNumbers.map((limit) => (
              <VStack
                key={limit._id}
                border="1px solid gray"
                p={4}
                w={{ base: "100%", md: "350px" }}
              >

                  <Flex justifyContent="space-between" width="100%"  bg="#92CCDC" padding="5px">
                    <FormLabel>
                      {limit.seller?.userName ||
                        limit.superVisor?.userName ||
                        "All"}
                    </FormLabel>
                    <FaTimesCircle className="limit-number-icon"  color="red"/>
                  </Flex>

                  <Flex justifyContent="space-between" width="100%"  bg="#92CCDC" padding="5px">

                    <FormLabel >{limit.lotteryCategoryName}</FormLabel>
                    <FaEdit className="limit-number-icon" color="yellow"/>
                  
                  </Flex>
                 
                <Flex background="#D9E6F1" padding="10px" wrap="wrap" gap={2} w="full" marginTop="1px">
                  {limit.limits.map((limitItem) => (
                    <Box key={limitItem.gameCategory} w="45%">
                      <FormLabel fontSize="sm">
                        {limitItem.gameCategory}
                      </FormLabel>
                      <Input
                        value={limitItem.limitsButs}
                        isReadOnly
                        size="sm"
                      />
                    </Box>
                  ))}
                </Flex>
              </VStack>
            ))}
          </Flex>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent bg="#A6A6A6" justifyContent="center">
          <ModalHeader
            bg="#7F7F7F"
            textColor="white"
            mb={4}
            display="flex"
            justifyContent="center"
          >
            {editing ? "EDIT LIMIT" : "ADD LIMIT"}
          </ModalHeader>
          <ModalBody>
            <form bg="#A6A6A6" justifyContent="center" onSubmit={handleSubmit}>
              <FormControl>
                <FormLabel>Lottery Category Name</FormLabel>
                <Select
                  bg="#bfbfbf"
                  color="black"
                  value={lotteryCategoryName}
                  onChange={(e) => setLotteryCategoryName(e.target.value)}
                >
                  {lotteryCategories.map((category) => (
                    <option key={category._id} value={category.lotteryName}>
                      {category.lotteryName}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {activeView === "supervisor" && (
                <FormControl>
                  <FormLabel>Supervisor</FormLabel>
                  <Select
                    bg="#bfbfbf"
                    color="black"
                    value={selectedSupervisor}
                    onChange={(e) => setSelectedSupervisor(e.target.value)}
                  >
                    <option value="">Select Supervisor</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor._id} value={supervisor._id}>
                        {supervisor.userName}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {activeView === "seller" && (
                <FormControl>
                  <FormLabel>Seller</FormLabel>
                  <Select
                    bg="#bfbfbf"
                    color="black"
                    value={selectedSeller}
                    onChange={(e) => setSelectedSeller(e.target.value)}
                  >
                    <option value="">Select Seller</option>
                    {sellers.map((seller) => (
                      <option key={seller._id} value={seller._id}>
                        {seller.userName}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Set Limit</FormLabel>
                <Flex wrap="wrap" gap={2}>
                  {[
                    { label: "BLT", value: blt, setValue: setBlt },
                    { label: "L3C", value: l3c, setValue: setL3c },
                    { label: "MRG", value: mrg, setValue: setMrg },
                    { label: "L4C1", value: l4c1, setValue: setL4c1 },
                    { label: "L4C2", value: l4c2, setValue: setL4c2 },
                    { label: "L4C3", value: l4c3, setValue: setL4c3 },
                    { label: "L5C1", value: l5c1, setValue: setL5c1 },
                    { label: "L5C2", value: l5c2, setValue: setL5c2 },
                    { label: "L5C3", value: l5c3, setValue: setL5c3 },
                  ].map((field) => (
                    <Box key={field.label} w="30%">
                      <FormLabel color="#7f7f7f" fontSize="sm">
                        {field.label}
                      </FormLabel>
                      <Input
                        type="number"
                        value={field.value}
                        bg="#bfbfbf"
                        onChange={(e) => field.setValue(e.target.value)}
                      />
                    </Box>
                  ))}
                </Flex>
              </FormControl>
              <Stack direction="row" spacing={4} justify="center" mt={6} mb={6}>
                <Button
                  type="submit"
                  mt={4}
                  bg="#c6d98d"
                  color="black"
                  _hover={{ bg: "#b2c270" }}
                  width="120px"
                >
                  {editing ? "Update" : "Add"} Limit
                </Button>
                <Button
                  onClick={onClose}
                  bg="#c6d98d"
                  color="black"
                  _hover={{ bg: "#b2c270" }}
                  width="120px"
                >
                  Cancel
                </Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default LimitNumber;
