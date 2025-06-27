import React, { useState, useEffect } from "react";
import api from "../../utils/customFetch.js";
// Chakra imports
import {
  Flex,
  Text,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useDisclosure,
  useToast,
  useColorMode,
  Image,
  Box
} from "@chakra-ui/react";

import { RiUserAddLine } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

function SubAdminManagement() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  console.log(colorMode);

  useEffect(async () => {
    try {
      await api()
        .get(`/admin/getsubadmin`)
        .then((response) => {
          setUsers(response.data);
        });
    } catch (err) {}
  }, []);

  const createUser = () => {
    let formData = new FormData();
    formData.append("userName",userName.trim());
    formData.append("password",password);
    formData.append("companyName",companyName.trim());
    formData.append("companyLogo",companyLogo);
    formData.append("address",address.trim());
    formData.append("phoneNumber",phoneNumber.trim());
    formData.append("isActive",isActive);
    api()
      .post(`/admin/addsubadmin`, formData,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setUsers([...users, response.data]);
        setUserName("");
        setPassword("");
        setCompanyLogo("");
        setCompanyName("");
        setAddress("");
        setPhoneNumber("");
        setIsActive(true);
        onClose();
        toast({
          title: "SubAdmin created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        console.log(error);
        toast({
          title: "Error creating SubAdmin.",
          description: error.response.data.error,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const updateUser = (id) => {
    const requestBody = {
      isActive,
    };
    if (userName != "") {
      requestBody.userName = userName.trim();
    }
    if (password != "") {
      requestBody.password = password;
    }
    if (companyName != "") {
      requestBody.companyName = companyName.trim();
    }
    if (phoneNumber != "") {
      requestBody.phoneNumber = phoneNumber.trim();
    }
    if (address != "") {
      requestBody.address = address.trim();
    }
    let formData = new FormData();
    formData.append("userName",requestBody.userName);
    formData.append("password",requestBody.password);
    formData.append("companyName",requestBody.companyName);
    formData.append("companyLogo",companyLogo);
    formData.append("address",requestBody.address);
    formData.append("phoneNumber",requestBody.phoneNumber);
    formData.append("isActive",isActive);
    api()
      .patch(`/admin/updatesubadmin/${id}`, formData,{
        "headers":{
          "Content-Type": "multipart/form-data",
        }
      })
      .then((response) => {
        setUsers(users.map((user) => (user._id === id ? response.data : user)));
        setUserName("");
        setPassword("");
        setCompanyName("");
        setAddress("");
        setPhoneNumber("");
        setIsActive(true);
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
      .delete(`/admin/deletesubadmin/${id}`)
      .then(() => {
        setUsers(users.filter((user) => user._id !== id));
        toast({
          title: "User deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleUserNameChange = (event) => {
    setUserName(event.target.value);
  };

  const handleCompanyNameChange = (event) => {
    setCompanyName(event.target.value);
  };

  const handleCompanyLogoChange = (event) => {
    setCompanyLogo(event.target.files[0]);
  };

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleIsActiveChange = (event) => {
    setIsActive(event.target.checked);
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
    setCompanyName(user.companyName);
    setAddress(user.address);
    setPhoneNumber(user.phoneNumber);
    setUserName(user.userName);
    setPassword("");
    setIsActive(user.isActive);
    onOpen();
  };

  const handleCancel = () => {
    setEditing(false);
    setCurrentUser(null);
    setUserName("");
    setPassword("");
    setCompanyName("");
    setAddress("");
    setPhoneNumber("");
    setIsActive(true);
    onClose();
  };

  return (
    <Flex direction="column" 
      pt={{ base: "120px", md: "75px" }} 
      mx="auto"
      justifyContent="center"
      alignItems="center"
      width="60%"
    >
      {/* Authors Table */}
      <Card
        p={{ base: "5px", md: "20px" }}
        width="100%"
        border={{ base: "none", md: "1px solid gray" }}
        bg="rgb(15, 15, 143)"
      >
        <CardHeader
          p="6px 0px 22px 0px"
          display="flex"
          justifyContent="space-between"
          bg="#92CCDC" 
        >
          <Text fontSize="lg" font="Weight:bold">
            SubAdmin
          </Text>
          <Button
            size="sm"
            onClick={onOpen}
            bg={colorMode === "light" ? "blue.500" : "blue.300"}
            _hover={{
              bg: colorMode === "light" ? "blue.600" : "blue.200",
            }}
            color="white"
          >
            {/* <RiUserAddLine size={24} color="white" /> */}
            ADD
          </Button>
        </CardHeader>
        <CardBody p="0px" m="0px" bg="#E2E2E2">
          <Flex flexWrap={"wrap"} width="100%">
            {users.map((item) => {
              let hasCompanyLogo = item.companyLogo != "" && item.companyLogo != undefined ? true : false;
              let companyLogoSrc = hasCompanyLogo ? process.env.REACT_APP_BACKEND_URL + `/${item.companyLogo}` : "/default-company.jpg";
              return (
              <Card
                size="sm"
                mx="8px"
                my="5px"
                style={{ "box-shadow": "0 0 2px 2px black" }}
                key={item._id}
                width={"18%"}
                border="none"
                p="5px"
                pt="20px"
                bg="#E2E2E2"
              >
                <Image
                    p="0px"
                    width="60px"
                    height="60px"
                    mx="auto"
                    borderRadius="50%"
                    src={companyLogoSrc}
                    alt={item?.companyName}
                />

              <Box> 
                <CardBody justifyContent={"center"} p="0px" m="0px">
                  <div style={{width:"100%"}}>
                    <Flex
                      direction={"column"}
                      justifyContent={"center"}
                      textAlign={"center"}
                      width={"100%"}
                    >
                      <h4>{item?.companyName}</h4>
                      <h6>{item?.address}</h6>
                      <h6>{item?.userName}</h6>
                      <h6>{item?.phoneNumber}</h6>
                      <h6>{item?.isActive ? "Active" : "Inactive"}</h6>
                    </Flex>
                    <Flex pt={"5px"} justifyContent={"center"}>
                      <Button
                        size="sm"
                        mr={2}
                        onClick={() => handleEdit(item)}
                        bg={colorMode === "light" ? "yellow.500" : "yellow.300"}
                        _hover={{
                          bg:
                            colorMode === "light" ? "yellow.600" : "yellow.200",
                        }}
                      >
                        <FaEdit size={16} color="white" />
                      </Button>
                      {/* <Button
                        size="sm"
                        onClick={() => deleteUser(item._id)}
                        bg={colorMode === "light" ? "red.500" : "red.300"}
                        _hover={{
                          bg: colorMode === "light" ? "red.600" : "red.200",
                        }}
                      >
                        <RiDeleteBinLine size={20} color="white"/>
                      </Button> */}
                    </Flex>
                  </div>
                </CardBody>
                </Box> 

              </Card>
            )})}
          </Flex>
        </CardBody>
      </Card>
      {/* Create/Edit User Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={editing ? "Edit User" : "Create User"}
        submitButtonText={editing ? "Update" : "Create"}
        onSubmit={handleSubmit}
        cancelButtonText="Cancel"
        onCancel={handleCancel}
        colorMode={colorMode}
      >
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Company Name</FormLabel>
            <Input
              type="text"
              value={companyName}
              onChange={handleCompanyNameChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Company Logo</FormLabel>
            <input
              type="file"
              // value={companyLogo}
              onChange={handleCompanyLogoChange}
              // bg={colorMode === "light" ? "white" : "gray.700"}
              //color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Address</FormLabel>
            <Input
              type="text"
              value={address}
              onChange={handleAddressChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="text"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Subadmin Name</FormLabel>
            <Input
              type="text"
              value={userName}
              onChange={handleUserNameChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Active</FormLabel>
            <Checkbox
              isChecked={isActive}
              onChange={handleIsActiveChange}
              colorScheme={colorMode === "light" ? "blue" : "gray"}
            >
              Active
            </Checkbox>
          </FormControl>
        </Stack>
      </Modal>
    </Flex>
  );
}

export default SubAdminManagement;
