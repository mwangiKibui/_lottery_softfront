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
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { RiUserAddLine } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { AxiosError } from "axios";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";


function SupervisorManagement() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAddMode, setIsAddMode] = useState(true); // New state to track mode

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await api().get(`/subadmin/getsuperVisor`);
        console.log(response.data);
        setUsers(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSupervisors();
  }, []);

  const createUser = () => {
    api()
      .post(`/subadmin/addsuperVisor`, {
        userName,
        password,
        isActive,
        // companyName,
      })
      .then((response) => {
        setUsers([...users, response.data]);
        resetForm();
        onClose();
        toast({
          title: "Supervisor created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        let errorMessage  = "";
        if(error instanceof AxiosError){
          errorMessage = error.response?.data?.error || `Error creating Supervisor.`;
        }else{
          errorMessage = `Error creating Supervisor.`;
        }
        toast({
          title: errorMessage,
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const updateUser = (id) => {
    const requestBody = {
      userName: userName || currentUser.userName, // Use existing value if not updated
      // companyName: companyName || currentUser.companyName, // Use existing value if not updated
      isActive: isActive !== undefined ? isActive : currentUser.isActive, // Update only if specified
    };

    if (password !== "") {
      requestBody.password = password; // Only add password if provided
    }

    api()
      .patch(`/subadmin/updatesuperVisor/${id}`, requestBody)
      .then((response) => {
        setUsers(users.map((user) => (user._id === id ? response.data : user)));
        resetForm();
        setEditing(false);
        setCurrentUser(null);
        onClose();
        toast({
          title: "Supervisor updated.",
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
      .delete(`/subadmin/deletesuperVisor/${id}`)
      .then(() => {
        setUsers(users.filter((user) => user._id !== id));
        toast({
          title: "Supervisor deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Error deleting Supervisor.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleUserNameChange = (event) => {
    setUserName(event.target.value.trim());
  };

  // const handleCompanyNameChange = (event) => {
  //   setCompanyName(event.target.value.trim());
  // };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value.trim());
  };

  const handleIsActiveChange = (event) => {
    setIsActive(event.target.checked);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!userName) {
      toast({
        title: "Error",
        description: "Username and company name are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isAddMode) {
      createUser();
    } else {
      updateUser(currentUser._id);
    }
  };

  const handleEdit = (user) => {
    setEditing(true);
    setIsAddMode(false); // Set to false for edit mode
    setCurrentUser(user);
    setUserName(user.userName);
    setPassword(""); // Reset password for security
    // setCompanyName(user.companyName);
    setIsActive(user.isActive);
    onOpen();
  };

  const handleAddSupervisor = () => {
    setEditing(false);
    setIsAddMode(true); // Set to true for add mode
    resetForm();
    onOpen();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setUserName("");
    setPassword("");
    // setCompanyName("");
    setIsActive(true);
  };

  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center" // Add this to center children horizontally
      width="100%"
      pt={{ base: "120px", md: "75px" }}
    >
      {/* Supervisors Table */}
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
            Supervisor Table
          </Text>
          <Button
            size="sm"
            onClick={handleAddSupervisor} // Separate button to add supervisor
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
                <Th color="black">Name</Th>
                <Th color="black">Company</Th>
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
                    <pre>{sessionStorage.getItem("company")}</pre>
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
        title={isAddMode ? "Create User" : "Edit User"} // Change title based on mode
        submitButtonText={isAddMode ? "Create" : "Update"} // Change button text based on mode
        onSubmit={handleSubmit}
        cancelButtonText="Cancel"
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
            {editing ? "EDIT SUPERVISOR" : "ADD SUPERVISOR"}
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

export default SupervisorManagement;
