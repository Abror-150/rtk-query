import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "./hooks/getEnv";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "antd";
const Stack = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const { data: stacks = [], isLoading } = useQuery({
    queryKey: ["stacks"],
    queryFn: () => axios.get(`${API}/stacks`).then((res) => res.data.data),
  });

  const { mutate: createStack } = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/stacks`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stacks"] });
      toast.success("Stack yaratildi");
      setName("");
      setImageBase64("");
      setFile(null);
    },
    onError: () => {
      toast.error("Xatolik yuz berdi");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const { mutate: deleteStack } = useMutation({
    mutationFn: (id: number) => axios.delete(`${API}/stacks/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stacks"] });
      toast.success("O'chirildi");
    },
  });
  const { mutate: updateStack } = useMutation({
    mutationFn: ({ id, data }: any) => axios.patch(`${API}/stacks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stacks"] });
      toast.success("Stack yangilandi");
      setIsEditModalOpen(false);
      setEditId(null);
      setEditName("");
    },
    onError: () => toast.error("Yangilashda xatolik"),
  });
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

  const handleCreate = () => {
    if (!name || !imageBase64) {
      toast.error("Nom va rasm talab qilinadi");
      return;
    }
    setIsSubmitting(true);
    createStack({ name, image: imageBase64 });
  };
  const openEditModal = (item: any) => {
    setEditId(item.id);
    setEditName(item.name);
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!editId || !editName.trim()) {
      toast.error("Ma’lumot yetarli emas");
      return;
    }
    updateStack({ id: editId, data: { name: editName } });
  };
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Create New Stack</h2>

      <div className="flex flex-col md:flex-row items-start gap-3 mb-6">
        <input
          type="text"
          placeholder="Stack nomi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full md:w-1/3"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded "
        >
          Create
        </button>
      </div>

      {imageBase64 && (
        <img
          src={imageBase64}
          alt="preview"
          className="w-60 h-40 object-cover mb-4 rounded border"
        />
      )}

      <h3 className="text-lg font-semibold mb-3">Stacks</h3>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stacks.map((item: any) => (
            <div
              key={item.id}
              className="bg-slate-800 text-white rounded p-3 shadow"
            >
              <img
                src={`${API}/file/${item.image}`}
                alt={item.name}
                className="w-full h-[150px] object-cover rounded mb-2"
              />
              <h4 className="text-lg font-bold">{item.name}</h4>
              <p className="text-sm text-gray-300">
                {new Date(item.createdAt).toLocaleString()}
              </p>
              <div className="space-x-5">
                <button
                  onClick={() => deleteStack(item.id)}
                  className="mt-3 bg-red-600 text-white px-3 py-1 rounded"
                >
                  O'chirish
                </button>
                <button
                  onClick={() => openEditModal(item)}
                  className="bg-yellow-500 text-black px-3 py-1 rounded"
                >
                  Tahrirlash
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal
        open={isEditModalOpen}
        title="Stackni tahrirlash"
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleUpdate}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="border w-full px-3 py-2 rounded"
          placeholder="Yangi nom"
        />
      </Modal>
    </div>
  );
};

export default Stack;
