import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API } from "../hooks/getEnv";

export const stacksApi = createApi({
  reducerPath: "stacksApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API,
  }),
  tagTypes: ["Stack"],
  endpoints: (builder) => ({
    getAllStacks: builder.query({
      query: () => ({
        method: "get",
        url: "/stacks",
        headers: { Authorization: "Bearer token " },
      }),
      providesTags: ["Stack"],
    }),
    createStack: builder.mutation({
      query: (data) => ({
        method: "POST",
        url: "/stacks",
        body: data,

        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Stack"],
    }),
    deleteStack: builder.mutation({
      query: (id: number) => ({
        method: "delete",
        url: `/stacks/${id}`,
      }),
      invalidatesTags: ["Stack"],
    }),
    updateStack: builder.mutation({
      query: ({ id, data }) => ({
        url: `/stacks/${id}`,
        method: "PATCH",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Stack"],
    }),
  }),
});
export const {
  useGetAllStacksQuery,
  useCreateStackMutation,
  useDeleteStackMutation,
  useUpdateStackMutation,
} = stacksApi;
