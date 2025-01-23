import React, { useState, useEffect } from "react";
import api from "../../utils/customFetch.js";
// Chakra imports
import {
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Button,
  FormControl,
  FormLabel,
  Input,
  Td,
  Tr,
  Stack,
  useDisclosure,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

function LotteryCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [lotteryName, setLotteryName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [editing, setEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  useEffect(async () => {
    try {
      await api().get(`/admin/getlotterycategory`).then((response) => {
        setCategories(response.data.data);
      });
    } catch (err) {}
  }, []);

  const createCategory = () => {
    api().post(`/admin/addlotterycategory`, {
        lotteryName: lotteryName.trim(),
        startTime: startTime,
        endTime: endTime,
      })
      .then((response) => {
        setCategories([...categories, response.data]);
        setLotteryName("");
        setStartTime("");
        setEndTime("");
        onClose();
        toast({
          title: "Lottery category created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Error creating lottery category.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const updateCategory = (id) => {
    const requestBody = {};
    if (lotteryName !== "") {
      requestBody.lotteryName = lotteryName.trim();
    }
    if (startTime !== "") {
      requestBody.startTime = startTime;
    }
    if (endTime !== "") {
      requestBody.endTime = endTime;
    }
    api().patch(`/admin/updatelotterycategory/${id}`, requestBody)
      .then((response) => {
        setCategories(
          categories.map((category) =>
            category._id === id ? response.data : category
          )
        );
        setLotteryName("");
        setStartTime("");
        setEndTime("");
        setEditing(false);
        setCurrentCategory(null);
        onClose();
        toast({
          title: "Lottery category updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Error updating lottery category.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const deleteCategory = (id) => {
    api().delete(`/admin/deletelotterycategory/${id}`).then(() => {
      setCategories(categories.filter((category) => category._id !== id));
      toast({
        title: "Lottery category deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  const handleLotteryNameChange = (event) => {
    setLotteryName(event.target.value);
  };

  const handleStartTimeChange = (event) => {
    setStartTime(event.target.value);
  };

  const handleEndTimeChange = (event) => {
    setEndTime(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editing) {
      updateCategory(currentCategory._id);
    } else {
      createCategory();
    }
  };

  const handleEdit = (category) => {
    setEditing(true);
    setCurrentCategory(category);
    setLotteryName(category.lotteryName);
    setStartTime(category.startTime);
    setEndTime(category.endTime);
    onOpen();
  };

  const handleCancel = () => {
    setEditing(false);
    setCurrentCategory(null);
    setLotteryName("");
    setStartTime("");
    setEndTime("");
    onClose();
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }} justifyContent="center"
    alignItems="center"
    width="100%">
      {/* Lottery Categories Table */}
      <Card 
       overflowX={{ sm: "scroll", xl: "hidden" }}
       p={{ base: "5px", md: "20px" }}
       width="60%"
       border={{ base: "none", md: "1px solid gray" }}
       borderRadius="none"
      >
        <CardHeader
          p="6px 0px 22px 0px"
          display="flex"
          justifyContent="space-between"
        >
          <Text fontSize="lg" font="Weight:bold">
            Lottery Categories Table
          </Text>
          <Button
            size="sm"
            onClick={onOpen}
            bg={colorMode === "light" ? "blue.500" : "blue.300"}
            _hover={{
              bg: colorMode === "light" ? "blue.600" : "blue.200",
            }}
          >
            <AiOutlineAppstoreAdd size={24} color="white"/>
          </Button>
        </CardHeader>
        <CardBody>
          <Table variant='striped'>
            <Thead>
              <Tr>
                <Th  >Name</Th>
                <Th  >Start Time</Th>
                <Th  >End Time</Th>
                <Th  >Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {categories.map((category) => {
                return (
                  <Tr key={category._id}>
                    <Td><pre>{category.lotteryName}</pre></Td>
                    <Td><pre>{category.startTime}</pre></Td>
                    <Td><pre>{category.endTime}</pre></Td>
                    <Td>
                      <Button
                        size="sm"
                        mr={2}
                        onClick={() => handleEdit(category)}
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
                        onClick={() => deleteCategory(category._id)}
                        bg={colorMode === "light" ? "red.500" : "red.300"}
                        _hover={{
                          bg: colorMode === "light" ? "red.600" : "red.200",
                        }}
                      >
                        <RiDeleteBinLine size={20} color="white"/>
                      </Button> */}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
      {/* Create/Edit Category Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={editing ? "Edit Category" : "Create Category"}
        submitButtonText={editing ? "Update" : "Create"}
        onSubmit={handleSubmit}
        cancelButtonText="Cancel"
        onCancel={handleCancel}
        colorMode={colorMode}
      >
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={lotteryName}
              onChange={handleLotteryNameChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Start Time</FormLabel>
            <Input
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
          <FormControl>
            <FormLabel>End Time</FormLabel>
            <Input
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
        </Stack>
      </Modal>
    </Flex>
  );
}

export default LotteryCategoryManagement;
