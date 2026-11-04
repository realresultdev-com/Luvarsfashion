import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import catalogReducer from "./productSlice";
import searchReducer, { clearUserSearchData } from "./searchSlice";

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Automatically wipe user search history from Redux when user logs out
if (typeof window !== "undefined") {
  window.addEventListener("auth:logout", () => {
    store.dispatch(clearUserSearchData());
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
