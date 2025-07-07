import "./App.css";
import { API } from "./hooks/getEnv";
import {
  useCreateStackMutation,
  useDeleteStackMutation,
  useGetAllStacksQuery,
  useUpdateStackMutation,
} from "./store/userSlice";
import toast, { Toaster } from "react-hot-toast";
import { Button, Input, Modal } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import React, { useState } from "react";

export interface StackType {
  id: number;
  name: string;
  createdAt: string;
  image: string;
}

function App() {
  const { data: stacks = {}, isLoading, isError } = useGetAllStacksQuery("");
  const [createStack] = useCreateStackMutation();
  const [deleteStack] = useDeleteStackMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [updateStack] = useUpdateStackMutation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setNewName("");
    setImageBase64("");
    setFile(null);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !imageBase64) {
      toast.error("Iltimos, nom va rasm tanlang");
      return;
    }

    const data = {
      name: newName,
      image: imageBase64,
    };

    try {
      await createStack(data).unwrap();
      toast.success("Stack yaratildi");
      handleCancel();
    } catch (error) {
      toast.error("Xatolik yuz berdi");
      console.error("Create Error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!id) {
      toast.error("ID topilmadi");
      return;
    }

    try {
      await deleteStack(id).unwrap();
      toast.success("Stack o'chirildi");
    } catch (error) {
      toast.error("O'chirishda xatolik");
      console.error("Delete Error:", error);
    }
  };
  const handleEdit = (item: StackType) => {
    setEditId(item.id);
    setEditName(item.name);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editId || !editName.trim()) {
      toast.error("Ma'lumotlar yetarli emas");
      return;
    }

    const data = {
      name: editName,
    };

    try {
      await updateStack({ id: editId, data }).unwrap();
      toast.success("Stack yangilandi");
      setIsEditModalOpen(false);
      setEditId(null);
      setEditName("");
    } catch (error) {
      toast.error("Tahrirlashda xatolik");
      console.error("Update error:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Xatolik yuz berdi</p>;

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex justify-between items-center p-3 bg-[#430ec9]">
        <h1 className="text-white font-bold text-[20px]">Stacks</h1>
        <Button onClick={showModal} type="primary" size="large">
          Create Stack
        </Button>
      </div>

      <Modal
        title="Create new stack"
        open={isModalOpen}
        onOk={handleCreate}
        onCancel={handleCancel}
        okText="Create"
      >
        <Input
          placeholder="Enter name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="mb-3"
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {imageBase64 && (
          <img
            src={imageBase64}
            alt="Preview"
            className="mt-3"
            style={{ width: "100%", maxHeight: "200px", objectFit: "contain" }}
          />
        )}
      </Modal>

      <div className="flex flex-wrap gap-[20px] p-5">
        {stacks?.data?.map((item: StackType) => (
          <div
            key={item.id}
            className="w-[250px] bg-slate-800 rounded-md overflow-hidden text-white"
          >
            <img
              className="mb-2 w-full h-[180px] object-cover"
              src={`${API}/file/${item.image}`}
              alt="Stack image"
            />
            <div className="p-3">
              <h2>{item.name}</h2>
              <p>{new Date(item.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-end justify-end pr-[5px] gap-[4px] pb-2">
              <Button
                danger
                onClick={() => {
                  setSelectedId(item.id);
                  setIsDeleteModalOpen(true);
                }}
              >
                <DeleteOutlined />
              </Button>
              <Button onClick={() => handleEdit(item)}>
                <EditOutlined />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        title="Confirm deletion"
        open={isDeleteModalOpen}
        onOk={async () => {
          if (selectedId !== null) {
            await handleDelete(selectedId);
            setIsDeleteModalOpen(false);
            setSelectedId(null);
          }
        }}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedId(null);
        }}
        okText="Yes, delete"
        cancelText="Cancel"
      >
        <p>Rostdan ham o‘chirmoqchimisiz?</p>
      </Modal>
      <Modal
        title="Edit stack"
        open={isEditModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="mb-3"
        />
      </Modal>
    </>
  );
}

export default App;
