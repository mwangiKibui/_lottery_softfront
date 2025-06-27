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
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Td,
  Tr,
  Stack,
  useDisclosure,
  useToast,
  useColorMode,
  Switch,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Select,
  Center,
  VStack, // Import Select for the dropdown
} from "@chakra-ui/react";

import { RiUserAddLine } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

function SellerManagement() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [imei, setImei] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [superVisors, setSuperVisors] = useState([]); // Store supervisors list
  const [selectedSuperVisor, setSelectedSuperVisor] = useState(""); // Selected supervisor ID

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [bonusFlag, setBonusFlag] = useState(false);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await api().get(`/subadmin/getsuperVisor`);
        console.log(response);
        setSuperVisors(response.data); // Set the fetched supervisors
      } catch (err) {
        console.error(err);
      }
    };
    fetchSupervisors();
  }, []);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await api().get(`/subadmin/getseller`);
        setUsers(response?.data?.users);
        setCompanyName(response?.data?.companyName);
        setBonusFlag(response?.data?.bonusFlag);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSellers();
  }, []);

  const createUser = () => {
    api()
      .post(`/subadmin/addseller`, {
        userName: userName.trim(),
        password,
        isActive,
        imei: imei.trim(),
        superVisorName: selectedSuperVisor || "", // Use selected supervisor ID
      })
      .then((response) => {
        console.log("response: " + JSON.stringify(response.data));
        
        setUsers([...users, response.data]);
        resetForm();
        onClose();
        toast({
          title: "Seller created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Error creating Seller.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const updateUser = (id) => {
    const requestBody = {
      isActive,
      userName: userName.trim(),
      imei: imei.trim(),
      superVisorName: selectedSuperVisor, // Include selected supervisor ID in update
    };
    if (password !== "") {
      requestBody.password = password;
    }
    api()
      .patch(`/subadmin/updateseller/${id}`, requestBody)
      .then((response) => {
        setUsers(users.map((user) => (user._id === id ? response.data : user)));
        resetForm();
        setEditing(false);
        setCurrentUser(null);
        onClose();
        toast({
          title: "User updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Error updating user.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const deleteUser = (id) => {
    api()
      .delete(`/subadmin/deleteseller/${id}`)
      .then(() => {
        setUsers(users.filter((user) => user._id !== id));
        toast({
          title: "User deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Error deleting user.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const resetForm = () => {
    setUserName("");
    setPassword("");
    setImei("");
    setIsActive(true);
    setSelectedSuperVisor(""); // Reset selected supervisor
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editing) {
      updateUser(currentUser._id);
    } else {
      createUser();
    }
  };

  const handleEdit = (user) => {
    setEditing(true);
    setCurrentUser(user);
    setUserName(user.userName);
    setPassword(""); // Reset password for security
    setImei(user.imei);
    setIsActive(user.isActive);
    setSelectedSuperVisor(user.superVisorName || ""); // Set selected supervisor for editing
    onOpen();
  };

  const handleCancel = () => {
    setEditing(false);
    setCurrentUser(null);
    resetForm();
    onClose();
  };

  // Handlers for input changes
  const handleUserNameChange = (event) => {
    setUserName(event.target.value);
  };

  const handleImeiChange = (event) => {
    setImei(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleIsActiveChange = (event) => {
    setIsActive(event.target.checked);
  };

  const handleSuperVisorChange = (event) => {
    setSelectedSuperVisor(event.target.value); // Update selected supervisor ID
  };

  return (
    <Flex
      direction="column"
      pt={{ base: "120px", md: "75px" }}
      justifyContent="center"
      alignItems="center" // Add this to center children horizontally
      width="100%"
    >
      {/* Sellers Table */}
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
          <Text fontSize="lg" color="black" fontWeight="bold">
            Seller Table
          </Text>
          <Button
            size="sm"
            onClick={onOpen}
            bg={colorMode === "light" ? "blue.500" : "blue.300"}
            _hover={{
              bg: colorMode === "light" ? "blue.600" : "blue.200",
            }}
          >
            <RiUserAddLine size={24} color="white" />
          </Button>
        </CardHeader>
        <CardBody>
          <Table variant="striped" color="black">
            <Thead>
              <Tr>
                <Th color="black">Seller</Th>
                <Th color="black">Company</Th>
                <Th color="black">Supervisor</Th>
                <Th color="black">Active</Th>
                <Th color="black">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user._id}>
                  <Td>
                    <pre>{user.userName}</pre>
                  </Td>
                  <Td>
                    <pre>{companyName}</pre>
                  </Td>
                  <Td>
                    <pre>{user.superVisorName || "None"}</pre>
                  </Td>
                  <Td>
                    <pre>{user.isActive ? "Yes" : "No"}</pre>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      mr={2}
                      onClick={() => handleEdit(user)}
                      bg={colorMode === "light" ? "yellow.500" : "yellow.300"}
                      _hover={{
                        bg: colorMode === "light" ? "yellow.600" : "yellow.200",
                      }}
                    >
                      <FaEdit size={20} color="white" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => deleteUser(user._id)}
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
        title="ADD SELLER"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        colorMode={colorMode}
      >
        <ModalContent bg="#A6A6A6" justifyContent="center">
          <ModalHeader
            bg="#7F7F7F"
            textColor="white"
            mb={4}
            display="flex"
            justifyContent="center"
          >
            {editing ? "EDIT SELLER" : "ADD SELLER"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <Flex alignItems="center">
                  <FormLabel color="#7f7f7f" mb="0" mr={4} width="120px">
                    Name:
                  </FormLabel>
                  <Input
                    type="text"
                    value={userName}
                    onChange={handleUserNameChange}
                    bg="#bfbfbf"
                    color="black"
                    height="40px"
                    width="300px" // Set fixed width
                  />
                </Flex>
              </FormControl>
              <FormControl>
                <Flex alignItems="center">
                  <FormLabel color="#7f7f7f" mb="0" mr={4} width="120px">
                    Device ID:
                  </FormLabel>
                  <Input
                    type="text"
                    value={imei}
                    onChange={handleImeiChange}
                    bg="#bfbfbf"
                    color="black"
                    height="40px"
                    width="300px" // Set fixed width
                  />
                </Flex>
              </FormControl>
              <FormControl>
                <Flex alignItems="center">
                  <FormLabel color="#7f7f7f" mb="0" mr={4} width="120px">
                    Password:
                  </FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    bg="#bfbfbf"
                    color="black"
                    height="40px"
                    width="300px" // Set fixed width
                  />
                </Flex>
              </FormControl>
              <FormControl>
                <Flex alignItems="center">
                  <FormLabel color="#7f7f7f" mb="0" mr={4} width="120px">
                    Supervisor:
                  </FormLabel>
                  <Select
                    placeholder="Select Supervisor"
                    value={selectedSuperVisor}
                    onChange={handleSuperVisorChange}
                    bg="#bfbfbf"
                    color="black"
                    height="40px"
                    width="300px" // Set fixed width
                  >
                    {superVisors.map((superVisor) => (
                      <option key={superVisor._id} value={superVisor.userName}>
                        {superVisor.userName}
                      </option>
                    ))}
                  </Select>
                </Flex>
              </FormControl>
              <FormControl bg="#bfbfbf">
                <FormLabel color="#7f7f7f" mb="0" mr={4} width="120px">
                  Active:
                </FormLabel>
                <Checkbox
                  isChecked={isActive}
                  onChange={handleIsActiveChange}
                  colorScheme="gray"
                  size="lg"
                >
                  Active
                </Checkbox>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={4} justify="center" mt={6} mb={6}>
              <Button
                onClick={handleSubmit}
                bg="#C6D98D"
                color="black"
                _hover={{ bg: "#b2c270" }}
                width="120px"
              >
                {editing ? "Update" : "Create"}
              </Button>
              <Button
                onClick={handleCancel}
                bg="#c6d98d"
                color="black"
                _hover={{ bg: "#b2c270" }}
                width="120px"
              >
                Cancel
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default SellerManagement;
