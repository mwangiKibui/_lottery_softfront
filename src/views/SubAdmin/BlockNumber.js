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
  Select,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

function BlockNumber() {
  const [editing, setEditing] = useState(false);
  const [currentBlockNumbers, setCurrentBlockNumbers] = useState(null);
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [gameCategories, setGameCategories] = useState([]);
  const [gameCategory, setGameCategory] = useState("");
  const [newBlockNumber, setNewBlockNumber] = useState("");
  const [blockNumbers, setBlockNumbers] = useState([]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const handleChangeBlockNumber = (event) => {
    if (gameCategory == "MRG" && event.target.value.trim().length == 2) {
      setNewBlockNumber(`${event.target.value}×`);
    } else {
      setNewBlockNumber(event.target.value);
    }
  };

  useEffect(async () => {
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

      try {
        const response = await api().get("/admin/getgamecategory");
        setGameCategories(response.data);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching game categories",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    try {
      await api()
        .get(`/subadmin/getblocknumber`)
        .then((response) => {
          setBlockNumbers(response.data);
        });
    } catch (err) {}

    fetchLotteryCategories();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editing) {
      updateBlockNumbers(currentBlockNumbers._id);
    } else {
      createBlockNumbers();
    }
  };

  const createBlockNumbers = () => {
    try {
      api()
        .post(`/subadmin/addblocknumber`, {
          lotteryCategoryName: lotteryCategoryName.trim(),
          gameCategory: gameCategory.trim(),
          number: newBlockNumber.trim(),
        })
        .then((res) => {
          setBlockNumbers([...blockNumbers, res.data]);
          setNewBlockNumber("");
          setLotteryCategoryName("");
          setGameCategory("");
          onClose();
          toast({
            title: "Block Numbers created.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        })
        .catch((err) => {
          toast({
            title: "Error creating Block Numbers.",
            description: err.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    } catch (err) {}
  };

  const handleEdit = (numbers) => {
    setEditing(true);
    setCurrentBlockNumbers(numbers);
    setLotteryCategoryName(numbers.lotteryCategoryName);
    setGameCategory(numbers.gameCategory);
    setNewBlockNumber(numbers.number);
    onOpen();
  };

  const deleteBlockNumbers = (id) => {
    api()
      .delete(`/subadmin/deleteblocknumber/${id}`)
      .then(() => {
        setBlockNumbers(blockNumbers.filter((number) => number._id !== id));
        toast({
          title: "Block Numbers deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const updateBlockNumbers = (id) => {
    try {
      api()
        .patch(`/subadmin/updateblocknumber/${id}`, {
          lotteryCategoryName: lotteryCategoryName.trim(),
          gameCategory: gameCategory.trim(),
          number: newBlockNumber.trim(),
        })
        .then((res) => {
          setBlockNumbers(
            blockNumbers.map((number) =>
              number._id === id ? res.data : number
            )
          );
          setNewBlockNumber("");
          setLotteryCategoryName("");
          setGameCategory("");
          onClose();
          toast({
            title: "Block Numbers updated.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        })
        .catch((err) => {
          toast({
            title: "Error updating Block Numbers.",
            description: err.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    } catch (err) {}
  };

  const handleCancel = () => {
    setEditing(false);
    onClose();
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }} justifyContent="center" alignItems="center" width="100%">
      {/* Authors Table */}
      <Card overflowX={{ sm: "scroll", xl: "hidden" }}
        p={{ base: "5px", md: "20px" }}
        width="60%"
        border={{ base: "none", md: "1px solid gray" }}
        borderRadius="none">
        <CardHeader
          p="6px 0px 22px 0px"
          display="flex"
          justifyContent="space-between"
        >
          <Text fontSize="lg" font="Weight:bold">
            Block Numbers Table
          </Text>
          <Button
            size="sm"
            onClick={() => {
              setLotteryCategoryName(lotteryCategories[0]?.lotteryName);
              setGameCategory(gameCategories[0]?.gameName);
              onOpen();
            }}
            bg={colorMode === "light" ? "blue.500" : "blue.300"}
            _hover={{
              bg: colorMode === "light" ? "blue.600" : "blue.200",
            }}
          >
            <FaPlus size={24} color="white" />
          </Button>
        </CardHeader>
        <CardBody>
          <Table variant="striped" color="black">
            <Thead>
              <Tr>
                <Th color="black">Lottery Name</Th>
                <Th color="black">Game Name</Th>
                <Th color="black">Block Number</Th>
                <Th color="black">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {blockNumbers.map((number) => (
                <Tr key={number._id}>
                  <Td><pre>{number.lotteryCategoryName}</pre></Td>
                  <Td><pre>{number.gameCategory}</pre></Td>
                  <Td><pre>{number.number}</pre></Td>
                  <Td>
                    <Button
                      size="sm"
                      mr={2}
                      onClick={() => handleEdit(number)}
                      bg={colorMode === "light" ? "yellow.500" : "yellow.300"}
                      _hover={{
                        bg: colorMode === "light" ? "yellow.600" : "yellow.200",
                      }}
                    >
                      <FaEdit size={20} color="white" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => deleteBlockNumbers(number._id)}
                      bg={colorMode === "light" ? "red.500" : "red.300"}
                      _hover={{
                        bg: colorMode === "light" ? "red.600" : "red.200",
                      }}
                    >
                      <RiDeleteBinLine size={20} color="white" />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
      {/* Create/Edit User Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={editing ? "Edit BlockNumber" : "Create BlockNumber"}
        submitButtonText={editing ? "Update" : "Create"}
        onSubmit={handleSubmit}
        cancelButtonText="Cancel"
        onCancel={handleCancel}
        colorMode={colorMode}
      >
        <Stack spacing={4}>
          <FormControl id="lotteryCategoryName" isRequired>
            <FormLabel>Lottery Category Name</FormLabel>
            <Select
              onChange={(event) => setLotteryCategoryName(event.target.value)}
              defaultValue={lotteryCategoryName}
            >
              {lotteryCategories.map((category) => (
                <option key={category._id} value={category.lotteryName}>
                  {category.lotteryName}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl id="gameName" isRequired>
            <FormLabel>Game Name</FormLabel>
            <Select
              onChange={(event) => setGameCategory(event.target.value)}
              defaultValue={gameCategory}
            >
              {gameCategories.map((name) => (
                <option key={name._id} value={name.gameName}>
                  {name.gameName}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl id="newLimitNumbers" isRequired>
            <FormLabel>Block Number</FormLabel>
            <Input
              type="text"
              value={newBlockNumber}
              background="none"
              onChange={handleChangeBlockNumber}
            />
          </FormControl>
        </Stack>
      </Modal>
    </Flex>
  );
}

export default BlockNumber;
