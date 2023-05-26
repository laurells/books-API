// import { useQuery } from '@apollo/client';
// import { GET_BOOKS_QUERY } from './path/to/your/backend/file';

// function BooksComponent() {
//   const { loading, error, data } = useQuery(GET_BOOKS_QUERY);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>Error: {error.message}</p>;
//   }

//   const { books } = data;

//   return (
//     <div>
//       {books.map((book) => (
//         <div key={book.id}>
//           <h2>{book.title}</h2>
//           <p>Author: {book.author}</p>
//         </div>
//       ))}
//     </div>
//   );
// }
